'use strict';
const router = require('express').Router();

const db = require('../db/models');
const utilities = require('../utilities');

const emailTransport = require('../email');
const logger = require('../logger');
const errorHelper = require('../error-helper');
const uploadHelper = require('../upload-helper');

const eventService = require('../event-service');

const sequelize = require('../db');

const ObjectStatus = require('../common/status-enum');

const securityHelper = require('../security-helper');

router.all('*', function (req, res, next) {
  if (!req.locals.user) return errorHelper.unauth(res);

  next();
});

router.get('/list', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;

  let wkList = await sequelize.query(`select w.id,w.name, w."createdBy", u2w.role, (select count(id) from board where "idWorkspace"=w.id and "status"=0) boardCount from "workspace" w inner join "user2workspace" u2w on u2w."idWorkspace"=w.id where u2w."idUser"=:idUser  and w.status=${ObjectStatus.Active}`, {
    replacements: {idUser: user.id},
    type: sequelize.QueryTypes.SELECT
  });

  return res.send(wkList);
}));

router.get('/:id', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = +req.params.id;

  const currentWorkspace = await db.workspace.findById(idWorkspace);
  if (!currentWorkspace) return errorHelper.notFound(res);

  res.send({name: currentWorkspace.name, id: currentWorkspace.id, description: currentWorkspace.description});
}));

router.get('/:id/users', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = +req.params.id;
  let user = req.locals.user;

  let wkCount = await db.workspace.count({where: { id: idWorkspace }});
  if (wkCount === 0) return errorHelper.notFound(res);

  let wkUsers = await sequelize.query('select u.id,u.name,u.email, u2w.role,u."imageUrl" from "user" u inner join user2workspace u2w on u2w."idUser"=u.id where u2w."idWorkspace"=:idWorkspace', {
    replacements: {idWorkspace: idWorkspace},
    type: sequelize.QueryTypes.SELECT
  });

  return res.send(wkUsers);
}));

router.post('/:id/users', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.id;
  let currentUser = req.locals.user;

  const canChange = await securityHelper.canModifyWorkspace(idWorkspace, currentUser.id);
  if(!canChange) return errorHelper.readonly(res);

  const userList = req.body;
  const currentWorkspace = await db.workspace.findById(idWorkspace);

  if(!userList || userList.length === 0) {
    return res.send({});
  }

  for(let invUser of userList) {
    //todo: is invitation pending? what to do!??!!?!

    if(invUser.id > 0) {
      if(invUser.deleted) {
        logger.warn(`member ${invUser.id} removed from worskpace ${idWorkspace} (by ${currentUser.name} ${currentUser.id})`);
        const u2w = await db.user2workspace.findOne({ where: {idUser: invUser.id, idWorkspace: idWorkspace} });
        if(u2w) {
          await u2w.destroy();
        }
      }
      else if(invUser.newRole !== invUser.role) {
        const user = await db.user.findOne({where: {id: invUser.id}});
        if (!user) {
          return !errorHelper.notFound(res);
        }
        const u2w = await db.user2workspace.findOne({where: {idUser: invUser.id, idWorkspace: idWorkspace}});

        if (u2w) {
          u2w.role = invUser.newRole;
          await u2w.save();
        }
      }
    }
    else if(invUser.id <= 0) {
      let name = invUser.name;
      let email = invUser.email;
      let role = invUser.role || 'r';

      if (!email) {
        return errorHelper.respondWithCode('EMAIL_REQUIRED');
      }
      if (!name) {
        name = email.split('@')[0]; //todo: extract to helper method!
      }

      const existingUser = await db.user.findOne({where: {email: email}});
      if (!existingUser) {
        const confirmKey = utilities.random();
        const invitation = await db.invitation.create({
          email: email,
          role: role,
          idWorkspace: idWorkspace,
          createdBy: currentUser.id,
          confirmKey: confirmKey
        });

        try {
          await emailTransport.send(email, 'invite-user', {
            name: name,
            email: email,
            confirmKey: confirmKey,
            senderName: currentUser.name,
            boardName: currentWorkspace.name
          }, currentUser);
        } catch (err) {
          logger.error('error inviting user', err);
          return errorHelper.respondWithCode('INVITE_EMAIL_FAILED', res);
        }

        eventService.sendEvent('user invitation sent', currentUser.id, {name: name, email: email});

      } else {
        await db.user2workspace.create({idUser: existingUser.id, idWorkspace: idWorkspace, role: role});

        try {
          await emailTransport.send(email, 'invite-existing-user', {
            name: name,
            email: email,
            cc: currentUser.email,
            senderName: currentUser.name,
            boardName: currentWorkspace.name
          }, currentUser);
        } catch (err) {
          logger.error('error inviting existing user', err);
          return errorHelper.respondWithCode('INVITE_EMAIL_FAILED', res);
        }
      }
    }
  }

  return res.send({});
}));

router.put('/:id', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;
  let newName = req.body.name;
  let newDescription = req.body.description;
  let idWorkspace = +req.params.id;

  if (!newName) return errorHelper.respondWithCode('NAME_REQUIRED', res);

  let existingWorkspace = await db.workspace.findOne({where: {id: idWorkspace, idClient: user.idClient}});

  const canChange = await securityHelper.canModifyWorkspace(idWorkspace, user.id);
  if(!canChange) return errorHelper.respondWithCode('USER_NO_RIGHTS', res);

  if (!existingWorkspace) return errorHelper.notFound(res);

  existingWorkspace.name = newName;
  existingWorkspace.description = newDescription;
  await existingWorkspace.save();

  res.send({});
}));

router.post('/', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;
  const workspaceName = req.body.name;


  if (!workspaceName) return errorHelper.respondWithCode('NAME_REQUIRED', res);

  let newWorkspace = await db.workspace.create({
    name: workspaceName,
    idClient: user.idClient,
    createdBy: user.id,
    status: ObjectStatus.Active,
  });

  //also add the user to it
  await db.user2workspace.create({idUser: user.id, idWorkspace: newWorkspace.id, role: 'a'});

  eventService.sendEvent('workspace created', user.id, {name: workspaceName});

  return res.send({id: newWorkspace.id});
}));


router.delete('/:id', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;
  const idWorkspace = +req.params.id;

  let existingWorkspace = await db.workspace.findOne({where: {id: idWorkspace, idClient: user.idClient}});

  if (!existingWorkspace) return errorHelper.notFound(res);

  const canChange = await securityHelper.canModifyWorkspace(idWorkspace, user.id);
  if(!canChange) return errorHelper.respondWithCode('USER_NO_RIGHTS', res);

  existingWorkspace.status = ObjectStatus.Deleted;

  await existingWorkspace.save();

  return res.send({});
}));

router.put('/:id/add-image', utilities.promiseCatch(async function(req, res) {
  const idWorkspace = +req.params.id;
  const user = req.locals.user;

  const hasRight = await securityHelper.canModifyWorkspace(idWorkspace, user.id);
  if (!hasRight) return errorHelper.readonly(res);

  let files = null;
  try {
    files = await uploadHelper.uploadMultiple(req, res, `${idWorkspace}/editor-images/`);
    return res.send(files[0]);
  } catch (uploadErr) {
    console.warn('cannot upload file: ' + uploadErr.message);
    return errorHelper.customError(uploadErr.message, res);
  }
}));

module.exports = router;
