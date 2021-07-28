'use strict';

const router = require('express').Router();

const db = require('../db/models');
const sequelize = require('../db');

const uploadHelper = require('../upload-helper');
const eventService = require('../event-service');

const slugify = require('slugify');
const utilities = require('../utilities');
const securityHelper = require('../security-helper');

const ObjectStatus = require('../common/status-enum');

const logger = require('../logger');
const emailTransport = require('../email');
const errorHelper = require('../error-helper');

router.post('/login', utilities.promiseCatch(async function (req, res) {
  let email = req.body.email;
  let pass = req.body.password;

  let err = [];
  if (!email) err.push(errorHelper.getError('EMAIL_REQUIRED'));
  if (!pass) err.push(errorHelper.getError('PASSWORD_REQUIRED'));

  if (err.length > 0) return errorHelper.respondWithList(err, res);

  const userToLogin = await db.user.findOne({where: {email: email, password: utilities.hash(pass)}});
  if (userToLogin) {
    //generate token & send
    userToLogin.lastAuth = new Date();
    await userToLogin.save();

    let token = utilities.generateToken(userToLogin.id);

    let userData = await getUserData(token, userToLogin);

    await db.userLogin.create({
      idUser: userToLogin.id,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    eventService.sendEvent('user logged in', userToLogin.id, null, { email: email } );

    return res.send(userData);
  }
  else {
    return errorHelper.respondWithCode('INVALID_CREDENTIALS', res);
  }
}));

router.post('/forgot', utilities.promiseCatch(async function (req, res) {
  let email = req.body.email;

  if (!email) {
    return errorHelper.respondWithCode('EMAIL_NOT_VALID', res);
  }

  //check if user exists
  const userToReset = await db.user.findOne({where: {email: email}});
  if (userToReset) {
    userToReset.confirmKey = utilities.random();

    await userToReset.save();

    await emailTransport.send(email, 'reset', {name: userToReset.name, confirmKey: userToReset.confirmKey}, userToReset);

    res.send({});
  }
  else {
    return errorHelper.respondWithCode('EMAIL_NOT_VALID', res);
  }
}));

router.post('/reset/:token', utilities.promiseCatch(async function (req, res) {
  let token = req.params.token;
  let newPass = req.body.password;

  console.log(token, newPass);

  if (!req.body.password) {
    return errorHelper.respondWithCode('NO_PASS', res);
  }

  //check if user exists
  const userToReset = await db.user.findOne({where: {confirmKey: token}});
  if (userToReset) {
    userToReset.password = utilities.hash(newPass);
    userToReset.confirmKey = null;

    await userToReset.save();

    res.send({});
  }
  else {
    return errorHelper.respondWithCode('INVALID_RESET_TOKEN', res);
  }
}));

router.post('/create-team', utilities.promiseCatch(async function (req, res) {
  const email = req.body.email;
  let name = req.body.name; // changed if empty to email
  const companyName = req.body.companyName;
  const password = req.body.password;
  const teamSize = req.body.teamSize;

  //1. validate
  let err = [];
  if (!email) err.push(errorHelper.getError('EMAIL_NOT_VALID'));
  if (!companyName) err.push(errorHelper.getError('COMPANY_NAME_NOT_VALID'));
  if (!password) err.push(errorHelper.getError('PASSWORD_REQUIRED'));

  if (err.length > 0) {
    return errorHelper.respondWithList(err, res);
  }

  //check if user exists
  const existingEmail = await db.user.findOne({where: {email: email}});
  if (existingEmail) {
    return errorHelper.respondWithCode('USER_EXISTS', res);
  }

  //normalize name
  if(!name) {
    name = email.split('@')[0];
  }

  //2. create client / user / workspace
  let userId = null;
  let wkId = null;
  let confirmKey = utilities.random();
  let user = null;

  await sequelize.transaction(async function (tx) {
    const client = await db.client.create({
      name: companyName,
      domain: slugify(companyName),
      plan: 'demo',
      teamSize: teamSize
    }, {transaction: tx});

    const workspace = await db.workspace.create({
      name: companyName,
      idClient: client.id
    }, {transaction: tx});

    user = await db.user.create({
      name: name,
      email: email,
      idClient: client.id,
      confirmed: false,
      confirmKey: confirmKey,
      lastWorkspaceId: workspace.id,
      password: utilities.hash(password)
    }, {transaction: tx});

    await db.user2workspace.create({
      idUser: user.id, idWorkspace: workspace.id, role: 'a'
    }, {transaction: tx});

    userId = user.id;
    wkId = workspace.id;
  });

  try {
    await emailTransport.send(email, 'welcome', {name: name, company: companyName, confirmKey: confirmKey}, user);

    let token = utilities.generateToken(userId);
    logger.info('new account token', token, userId, wkId);

    eventService.sendEvent('account created', userId, { company: companyName, name: name } );

    //3. return with client id auth + auth token
    return res.send({token: token, workspace: wkId});
  }
  catch (err) {
    logger.error('Error sending email', err);

    return errorHelper.respondWithCode('WELCOME_EMAIL_FAILED', res);
  }
}));

router.post('/validate/:workspaceId?', utilities.promiseCatch(async function(req, res) {
  let user = req.locals.user;

  if(!user) return errorHelper.unauth(res);

  let workspaceId = +req.params.workspaceId || null;
  if(workspaceId) {
    const wk = await db.workspace.findById(workspaceId);
    if (wk.status !== ObjectStatus.Active)
      return errorHelper.notFound(res);
  }

  let userData = await getUserData(req.locals.token, user, workspaceId);
  delete userData.token; //no need for token

  res.send(userData);
}));

router.get('/edit', utilities.promiseCatch(async function(req, res) {
  let user = req.locals.user;

  if(!user) return errorHelper.unauth(res);

  res.send({
    id: user.id,
    name: user.name,
    email: user.email,
    theme: user.theme,
    imageUrl: user.imageUrl
  });
}));

router.post('/update', utilities.promiseCatch(async function(req, res) {
  let user = req.locals.user;

  if(!user) return errorHelper.unauth(res);

  let awsFilePaths = null;

  try {
    awsFilePaths = await uploadHelper.uploadAndResizeImage(req, res);
  }
  catch(ex) {
    logger.error('error uploading account file:', ex);
    return errorHelper.respondWithCode('FILE_UPLOAD_ERROR', res);
  }

  if (req.body.email) user.email = req.body.email;
  if (req.body.name) user.name = req.body.name;
  if (req.body.theme) user.theme = req.body.theme;
  if (req.body.password) user.password = utilities.hash(req.body.password);

  if (awsFilePaths) user.imageUrl = awsFilePaths;

  await user.save();

  res.send({image: awsFilePaths});

}));

router.get('/workspaces', utilities.promiseCatch(async function(req, res) {
  let user = req.locals.user;

  if(!user) return errorHelper.unauth(res);

  let workspaceList = await getWorkspaceList(user.id);

  res.send(workspaceList.map(w => { return {
    id: w.id,
    name: w.name,
    role: w.role,
    isCreator: w.createdBy === user.id,
    boardCount: w.boardCount
  }; }));
}));

router.post('/loginas', utilities.promiseCatch(async function(req, res) {
  let user = req.locals.user;

  if(!user || !user.isAdmin) return errorHelper.readonly(res);

  const userToLogin = await db.user.findOne({where: {email: req.body.email}});
  if (userToLogin) {
    //generate token & send
    return res.send({token: utilities.generateToken(userToLogin.id), lastWorkspaceId: userToLogin.lastWorkspaceId});
  }
  return res.send({});
}));

router.get('/invitation/:token', utilities.promiseCatch(async function (req, res) {
  const invitation = await db.invitation.findOne({where: {confirmKey: req.params.token}, raw: true});
  if(!invitation) {
    return errorHelper.notFound(res);
  }

  const wk = await db.workspace.findById(invitation.idWorkspace);
  const inviter = await db.user.findById(invitation.createdBy);

  return res.send({
    email: invitation.email,
    role: invitation.role,
    workspaceName: wk.name
  });
}));

router.post('/invitation/:token', utilities.promiseCatch(async function (req, res) {
  const name = req.body.name;
  const password = req.body.password;

  const invitation = await db.invitation.findOne({where: {confirmKey: req.params.token}});
  if(!invitation) {
    return errorHelper.notFound(res);
  }

  let tx = null;
  try {
    tx = await db.raw.transaction();
    //create user
    //create user2workspace
    //return token + id workspace
    const wk = await db.workspace.findById(invitation.idWorkspace);

    const user = await db.user.create({
      name: name,
      email: invitation.email,
      idClient: wk.idClient,
      confirmed: true,
      lastWorkspaceId: wk.id,
      password: utilities.hash(password)
    }, {transaction: tx});

    await db.user2workspace.create({
      idUser: user.id,
      idWorkspace: wk.id,
      role: invitation.role
    }, {transaction: tx});

    await invitation.destroy();
    tx.commit();
    tx = null;

    let token = utilities.generateToken(user.id);

    eventService.sendEvent('invitation accepted', user.id);

    //3. return with client id auth + auth token
    return res.send({token: token, workspace: wk.id});
  }
  catch(err) {
    logger.error('Error accepting invitation: ', err);
    tx && tx.rollback();
  }

}));

async function getUserData(token, user, activeWorkspaceId) {
  let workspaceList = await getWorkspaceList(user.id);

  if(activeWorkspaceId && user.lastWorkspaceId !== activeWorkspaceId) {
    user.lastWorkspaceId = activeWorkspaceId;
    await user.save();
  }

  return {
    id: user.id,
    token: token,
    workspaceId: user.lastWorkspaceId,
    name: user.name,
    theme: user.theme,
    email: user.email,
    img: user.imageUrl,
    isAdmin: user.isAdmin,
    workspaceRole: await securityHelper.getWorkspaceRight(user.lastWorkspaceId, user.id),
    workspaceList: workspaceList
  };
}

async function getWorkspaceList(idUser) {
  return db.raw.query(`select w.id,w.name, w."createdBy", u2w.role, (select count(id) from board where "idWorkspace"=w.id and status=0) "boardCount" from "workspace" w inner join "user2workspace" u2w on u2w."idWorkspace"=w.id where u2w."idUser"=:idUser and w."deletedAt" is null and w.status=${ObjectStatus.Active}`, {
    replacements: { idUser: idUser },
    type: sequelize.QueryTypes.SELECT
  });
}

module.exports = router;
