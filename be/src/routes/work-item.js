const router = require('express').Router({mergeParams: true});

const db = require('../db/models');
const utilities = require('../utilities');

const securityHelper = require('../security-helper');
const logger = require('../logger');
const errorHelper = require('../error-helper');
const emailTransport = require('../email');

const uploadHelper = require('../upload-helper');
const orderHelper = require('../order-helper');

const sequelize = require('../db');
const workItemService = require('../work-item-service');

const webSocket = require('../web-socket');

const ObjectStatus = require('../common/status-enum');
const UpdateType = require('../common/update-type');

const FILE_FIELD = 'file';
const COMMENT_FIELD = 'comment';

router.all('*', function (req, res, next) {
  if (!req.locals.user) return errorHelper.unauth(res);

  //need board for all operations
  if (!req.params.idBoard) return errorHelper.notFound(res);

  next();
});

router.get('/list', utilities.promiseCatch(async function (req, res) {
  let idBoard = +req.params.idBoard;
  if(Number.isNaN(idBoard)) {
    return errorHelper.notFound(res);
  }

  let user = req.locals.user;

  if (!securityHelper.canReadBoard(idBoard, user.id)) return errorHelper.unauth(res);

  let board = await db.board.findOne({where: {id: idBoard}});

  if (!board) {
    return errorHelper.notFound(res);
  }

  let structure = board.dataStructure || '[]';
  let json = JSON.parse(structure);
  
  let workItemList = await db.workItem.findAll({
    attributes: ['id', 'title', 'description', 'order', 'data', 'idParent', 'idNest'],
    where: {idBoard: idBoard, status: ObjectStatus.Active},
    raw: true
  });

  const wiIds = workItemList.map(w => w.id);

  const commentsMap = {};
  const filesMap = {};
  if (wiIds.length > 0) {
    const commentsPerWi = await db.raw.query(`select "idWorkItem", count(*) cnt from "workItemComment" where "idWorkItem" in (:wiIds) and status=${ObjectStatus.Active} group by "idWorkItem"`, {
      replacements: {wiIds: wiIds},
      type: sequelize.QueryTypes.SELECT
    });

    for (let c of commentsPerWi) {
      commentsMap[c.idWorkItem] = c.cnt;
    }

    const filesPerWi = await db.raw.query(`select "idWorkItem", count(*) cnt from "workItemFile" where "idWorkItem" in (:wiIds) and status=${ObjectStatus.Active} group by "idWorkItem"`, {
      replacements: {wiIds: wiIds},
      type: sequelize.QueryTypes.SELECT
    });

    for (let c of filesPerWi) {
      filesMap[c.idWorkItem] = c.cnt;
    }
  }

  for (let item of workItemList) {
    item.data = JSON.parse(item.data || '{}');

    item[COMMENT_FIELD] = commentsMap[item.id] || 0;
    item[FILE_FIELD] = filesMap[item.id] || 0;

    for (let field of json) {
      switch (field.type) {
        case 'dependency':
          let itemIds = item.data[field.id];
          if (itemIds && itemIds.length > 0) {
            let woList = await db.raw.query(`select wi.id, wi.title, b.id "boardId", b."name" "boardName", 0 "completion" from "workItem" wi
              inner join board b on b.id=wi."idBoard"
              where wi.id=ANY('{${itemIds.join(',')}}'::int[]) and b."idWorkspace"=:idWk `, {
              replacements: {idWk: board.idWorkspace},
              type: sequelize.QueryTypes.SELECT
            });
            item[field.id] = woList;
          }
          else {
            item[field.id] = [];
          }
          break;
        default:
          let fieldData = item.data[field.id];
          if(fieldData === undefined) fieldData = null;
          item[field.id] = item.data[field.id];

          break;
      }

    }
  }

  let nestList = await db.nest.findAll({
    attributes: ['id', 'name', 'color', 'order'],
    where: {idBoard: idBoard, status: ObjectStatus.Active},
    order: ['order'],
    raw: true
  });

  workItemList.forEach(item => delete item.data);

  let response = {nests: nestList, fields: json.sort((a, b) => a.order - b.order)};
  for (let nest of response.nests) {
    nest.workItems = workItemList.filter(w => w.idNest === nest.id).sort((a, b) => a.order - b.order);
  }

  response.users = await getUserList(board.boardAccessType, board.idWorkspace, idBoard);

  //create fake nest for workItems witout one
  let wiNoNest = workItemList.filter(w => w.idNest === null).sort((a, b) => a.order - b.order);

  if (wiNoNest.length > 0) response.nests.push({name: '', id: '', workItems: wiNoNest});

  return res.send(response);
}));

router.get('/:idWorkItem', utilities.promiseCatch(async function (req, res) {
  let idBoard = +req.params.idBoard;
  let idWorkItem = +req.params.idWorkItem;

  let user = req.locals.user;

  if (!securityHelper.canReadBoard(idBoard, user.id)) return errorHelper.unauth(res);

  let board = await db.board.findOne({where: {id: idBoard}});

  let structure = board.dataStructure || '[]';
  let json = JSON.parse(structure);

  let workItem = await db.workItem.findOne({
    attributes: ['id', 'title', 'description', 'idParent', 'data', 'idNest'],
    where: {id: idWorkItem},
    raw: true
  });

  if (!workItem) return errorHelper.notFound(res);

  workItem.data = JSON.parse(workItem.data || '{}');

  workItem[COMMENT_FIELD] = await db.workItemComment.findAll({
    offset: 0,
    limit: 20,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'comment', 'createdAt', 'createdBy'],
    where: {idWorkItem: idWorkItem, status: ObjectStatus.Active},
    raw: true
  });

  workItem[FILE_FIELD] = await db.workItemFile.findAll({
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'url', 'mimeType', 'createdAt', 'createdBy', 'idComment'],
    where: {idWorkItem: idWorkItem, status: ObjectStatus.Active},
    raw: true
  });

  for (let comm of workItem[COMMENT_FIELD]) {
    //console.log('comm', comm);
    const files = workItem[FILE_FIELD].filter(f => f.idComment === comm.id);
    comm.files = files;
  }

  for (let field of json) {
    if ([COMMENT_FIELD, FILE_FIELD].indexOf(field.id) > -1) continue;

    switch (field.type) {
      case 'dependency':
        let itemIds = workItem.data[field.id];
        if (itemIds && itemIds.length > 0) {
          let woList = await db.raw.query(`select wi.id, wi.title, b.id "boardId", b."name" "boardName", 0 "completion" from "workItem" wi
            inner join board b on b.id=wi."idBoard"
            where wi.id=ANY('{${itemIds.join(',')}}'::int[]) and b."idWorkspace"=:idWk `, {
            replacements: {idWk: board.idWorkspace},
            type: sequelize.QueryTypes.SELECT,
            raw: true
          });
          workItem[field.id] = woList;
        }
        else {
          workItem[field.id] = [];
        }
        break;
      default:
        //console.log('dynamic field: ', field.name, item.data[field.name]);
        workItem[field.id] = workItem.data[field.id] || null;

        break;
    }
  }

  let nest = await db.nest.findOne({attributes: ['id', 'name'], where: {id: workItem.idNest}, raw: true});
  workItem.nest = {id: nest.id, name: nest.name};
  workItem.fields = json;

  delete workItem.idNest;
  delete workItem.data;

  return res.send(workItem);
}));

router.post('/', utilities.promiseCatch(async function (req, res) {
  let idBoard = +req.params.idBoard;
  let idWorkspace = +req.params.idWorkspace;
  let user = req.locals.user;

  let title = req.body.title;
  let description = req.body.description;
  let status = +req.body.status || ObjectStatus.Active;
  let idNest = +req.body.idNest || null;

  let idParent = +req.body.idParent || null; //todo: validate idWorkItem!
  let externalUrl = req.body.externalUrl || null;

  if (!title) return errorHelper.respondWithCode('TITLE_REQUIRED', res);

  let board = await db.board.findOne({where: {id: idBoard}});

  const idWorkItemNest = idNest || board.idDefaultNest;

  let nextOrder = ((await db.workItem.max('order', {
    where: {
      idBoard: idBoard,
      idNest: idWorkItemNest
    }
  })) || 0) + 1;

  let tx = null;

  try {
    tx = await db.raw.transaction();

    let newItem = await db.workItem.create({
      title: title,
      description: description,
      idBoard: idBoard,
      order: nextOrder,
      status: status,
      createdBy: user.id,
      idParent: idParent,
      idNest: idWorkItemNest,
      externalUrl: externalUrl
    }, {tx});

    db.workItemAction.create({
      idWorkItem: newItem.id,
      updateType: UpdateType.WorkItemCreated,
      idBoard: idBoard,
      idWorkspace: idWorkspace,
      meta: {title: newItem.title, idNest: newItem.idNest},
      createdBy: user.id
    }, {tx});

    tx.commit();

    webSocket.pushEvent('workItemCreated', {
      idBoard: newItem.idBoard,
      idNest: newItem.idNest,
      id: newItem.id,
      title: newItem.title
    });

    return res.send({id: newItem.id, order: nextOrder, idNest: newItem.idNest});
  }
  catch (err) {
    logger.error('Error adding workItem: ', err);
    tx && tx.rollback();

    return errorHelper.serverError(res, 'Error adding work item!');
  }

}));

router.put('/:idWorkItem', utilities.promiseCatch(async function (req, res) {
  let workItem = await checkBoardAccessAndGetWI(req, res);
  if(!workItem) return;

  const idWorkspace = +req.params.idWorkspace;
  const user = req.locals.user;

  if (!workItem) return errorHelper.notFound(res);

  let title = req.body.title;
  let description = req.body.description;
  let idBoard = +req.body.idBoard;
  let newOrder = +req.body.order;
  let status = +req.body.status;
  let idParent = +req.body.idParent;
  let externalUrl = req.body.externalUrl;
  let idNest = +req.body.idNest;

  const changedProps = {};

  if (title && workItem.title !== title) {
    changedProps.old_title = workItem.title;
    changedProps.new_title = title;

    workItem.title = title;
  }
  if (description && workItem.description !== description) {
    changedProps.old_description = workItem.description;
    changedProps.new_description = description;

    workItem.description = description;
  }
  if (status && workItem.status !== status) {
    changedProps.old_status = workItem.status;
    changedProps.new_status = status;

    workItem.status = status;
  }

  if (idParent) {
    let parent = await db.workItem.findOne({attributes: ['id'], where: {id: idParent}});

    if (!parent) {
      return errorHelper.respondWithCode('PARENT_NOT_FOUND', res);
    }

    if (workItem.idParent !== idParent) {
      changedProps.old_idParent = workItem.idParent;
      changedProps.new_idParent = idParent;

      workItem.idParent = idParent;
    }
  }
  else if (req.body.idParent === null) {
    if (workItem.idParent !== null) {
      changedProps.old_idParent = workItem.idParent;
      changedProps.new_idParent = idParent;

      workItem.idParent = null;
    }
  }

  if (externalUrl) workItem.externalUrl = externalUrl;

  if (idBoard) {
    let board = await db.board.findOne({attributes: ['id'], where: {id: idBoard}});

    if (!board) {
      return errorHelper.respondWithCode('BOARD_NOT_FOUND', res);
    }

    if (workItem.idBoard !== idBoard) {
      changedProps.old_idBoard = workItem.idBoard;
      changedProps.new_idBoard = idBoard;
      changedProps.old_idNest = workItem.idNest;
      changedProps.new_idNest = board.idDefaultNest;

      workItem.idNest = board.idDefaultNest;
      workItem.idBoard = idBoard;
    }
  }

  if (idNest && workItem.idNest !== idNest) {
    let nest = await db.nest.findOne({attributes: ['id', 'idBoard'], where: {id: idNest}});

    if (!nest) {
      return errorHelper.respondWithCode('NEST_NOT_FOUND', res);
    }

    changedProps.old_idNest = workItem.idNest;
    changedProps.new_idNest = idNest;
    if (workItem.idBoard !== nest.idBoard) {
      changedProps.old_idBoard = workItem.idBoard;
      changedProps.new_idBoard = idBoard;
    }

    workItem.idBoard = nest.idBoard;
    workItem.idNest = idNest;
  }

  if (newOrder && workItem.order !== newOrder) {
    //reorder. update existing before update
    let oldOrder = workItem.order;

    await orderHelper.changeOrder(oldOrder, newOrder, 'workItem', '"idBoard"=:idBoard and "idNest"=:idNest', {
      idBoard: workItem.idBoard,
      idNest: workItem.idNest
    });

    workItem.order = newOrder;
  }

  let tx = null;
  try {
    tx = await db.raw.transaction();

    await workItem.save({tx});

    if (Object.keys(changedProps).length > 0) {
      await db.workItemAction.create({
        idWorkItem: workItem.id,
        updateType: UpdateType.WorkItemModified,
        idBoard: workItem.idBoard,
        idWorkspace: idWorkspace,
        meta: Object.assign(changedProps, {title: workItem.title}),
        createdBy: user.id
      }, {tx});
    }

    await tx.commit();

    return res.send({});
  }
  catch (err) {
    logger.error('Error changing work item, ', err);

    if (tx) await tx.rollback();

    return errorHelper.serverError(res, 'Error saving work item');
  }
}));

router.post('/:idWorkItem/field', utilities.promiseCatch(async function (req, res) {
  let workItem = await checkBoardAccessAndGetWI(req, res);
  if(!workItem) return;

  let currentUser = req.locals.user;

  if (!workItem) return errorHelper.notFound(res);

  let board = await db.board.findOne({where: {id: workItem.idBoard}});

  let woConfig = JSON.parse(board.dataStructure);
  let woData = JSON.parse(workItem.data) || {};

  const changedFields = [];
  const refToCheck = [];

  for (let key of Object.keys(req.body)) {

    //find fields in wo config + validate!
    let fieldConfig = woConfig.find(c => c.id === key);

    if (!fieldConfig) return errorHelper.respondWithCode('FIELD_NOT_FOUND ' + key, res);

    if (isFieldValid(fieldConfig, req.body[key])) {

      changedFields.push({idField: key, newValue: req.body[key], oldValue: woData[key]});

      if (fieldConfig.originalType === 'dependency') {
        let original = woData[key] || [];
        original = req.body[key];

        woData[key] = original;
      }
      else if (fieldConfig.originalType === 'person') {
        let idUser = req.body[key];
        let user = await findBoardUser(board.boardAccessType, board.idWorkspace, board.id, idUser);

        if (user && user.id !== currentUser.id) {
          await emailTransport.send(user.email, 'assign-user', {
            name: user.name,
            email: user.email,
            senderName: user.name,
            boardId: board.id,
            boardName: board.name,
            workItemName: workItem.title,
            workItemId: workItem.id,
            workspaceId: board.idWorkspace,
            asignerName: currentUser.name
          });
        }
        woData[key] = idUser;
      }
      else {
        woData[key] = req.body[key];

        if(key === board.doneField && woData[key] == board.doneValue) { //don't care about type, just value
          refToCheck.push(workItem.id);
        }
      }
    }
    else return errorHelper.respondWithCode('FIELD_NOT_VALID ' + key, res);
  }

  let tx = null;
  try {
    tx = await db.raw.transaction();

    if (changedFields.length > 0) {
      await db.workItemAction.create({
        idWorkItem: workItem.id,
        updateType: UpdateType.WorkItemFieldsModified,
        idBoard: workItem.idBoard,
        idWorkspace: board.idWorkspace,
        meta: {title: workItem.title, fields: changedFields},
        createdBy: currentUser.id
      }, {tx});
    }

    workItem.data = JSON.stringify(woData);
    await workItem.save({tx});

    for(let wi of refToCheck) {
      await workItemService.updateGoals(workItem.id, board.idWorkspace, tx);
    }

    await tx.commit();

    return res.send({});
  }
  catch (err) {
    logger.error('Error changing work item field! ', err);

    if (tx) await tx.rollback();

    return errorHelper.serverError(res, 'Error saving work item field');
  }


}));

router.put('/:idWorkItem/comment/:id?', utilities.promiseCatch(async function (req, res) {

  const idBoard = +req.params.idBoard;

  let workItem = await checkBoardAccessAndGetWI(req, res);
  if (!workItem) return errorHelper.notFound(res);

  let board = await db.board.findById(workItem.idBoard);
  if (!board) return errorHelper.notFound(res);

  let files = null;
  try {
    files = await uploadHelper.uploadMultiple(req, res, `${board.idWorkspace}/${idBoard}/${workItem.id}/comment-file`);
  }
  catch(uploadErr) {
    console.warn('cannot upload file: ' + uploadErr.message);
    return errorHelper.customError(uploadErr.message, res);
  }

  let user = req.locals.user;
  let comment = req.body.comment;
  let mentions = req.body.mentions;
  let id = +req.params.id || null;

  if (!comment) return errorHelper.respondWithCode('COMMENT_NOT_PROVIDED', res);
  if (!user) return errorHelper.respondWithCode('USER_NOT_PROVIDED', res);

  const uploadedFiles = [];
  let commentDb = null;
  let tx = null;
  try {
    tx = await db.raw.transaction();

    if (id) {
      commentDb = await db.workItemComment.findOne({where: {id: id}}, {tx});
      if (!commentDb || workItem.id !== commentDb.idWorkItem) return !errorHelper.notFound(res);

      if(commentDb.createdBy !== user.id) return errorHelper.respondWithCode('USER_NOT_CREATOR', res);

      commentDb.comment = comment;
      await commentDb.save();
    }
    else {
      commentDb = await db.workItemComment.create({
        idWorkItem: workItem.id,
        createdBy: user.id,
        status: ObjectStatus.Active,
        comment: comment
      }, {tx});

      await db.workItemAction.create({
        idWorkItem: workItem.id,
        updateType: UpdateType.WorkItemCommentAdded,
        idBoard: workItem.idBoard,
        idWorkspace: board.idWorkspace,
        meta: {title: workItem.title},
        createdBy: user.id
      }, {tx});
    }

    //update new files, if any
    if (files && files.length) {
      for (let file of files) {
        const fileDb = await db.workItemFile.create({
          idWorkItem: workItem.id,
          name: file.name,
          url: file.url,
          mimeType: file.mimeType,
          status: ObjectStatus.Active,
          createdBy: user.id,
          idComment: commentDb.id
        }, {tx});

        uploadedFiles.push(fileDb);
      }
    }

    tx.commit();
  }
  catch (ex) {
    tx && tx.rollback();

    logger.error('error creating / updating comment: ', ex);

    return errorHelper.getError('CANNOT_SAVE', res);
  }

  if (mentions && mentions.length > 0) {
    //send mentions to users:

    let normalizedMention = mentions;
    if(mentions.split) {
      normalizedMention = mentions.split(',');
    }

    for (let idUser of normalizedMention) {
      //if(idUser === user.id) continue; //don't notify poster!
      // special value: ALL

      let mentionUser = await findBoardUser(board.boardAccessType, board.idWorkspace, board.id, idUser);

      if (mentionUser) {
        await emailTransport.send(mentionUser.email, 'mention-user', {
          commentorName: user.name,
          name: mentionUser.name,
          commentText: comment,

          senderName: user.name,
          boardId: workItem.idBoard,
          workItemName: workItem.title,
          workItemId: workItem.id,
          workspaceId: board.idWorkspace
        });
      }
    }
  }
  return res.send({id: commentDb.id, files: uploadedFiles});
}));

router.delete('/:idWorkItem/comment/:id', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;
  let comment = req.body.comment;
  let id = +req.params.id || null;

  let workItem = await checkBoardAccessAndGetWI(req, res);
  if(!workItem) return;

  if (!workItem) return errorHelper.notFound(res);

  if (id) {
    let commentDb = await db.workItemComment.findOne({where: {id: id}});
    if (!commentDb || workItem.id !== commentDb.idWorkItem) return !errorHelper.notFound(res);

    if(commentDb.createdBy !== user.id) return errorHelper.respondWithCode('USER_NOT_CREATOR', res);

    commentDb.status = ObjectStatus.Deleted;
    await commentDb.save();

    return res.send({});
  }

  return errorHelper.notFound(res);
}));

//const workItemFileUpload = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'files', maxCount: 8 }]);
router.put('/:idWorkItem/file', utilities.promiseCatch(async function (req, res) {

  let workItem = await checkBoardAccessAndGetWI(req, res);
  if(!workItem) return;

  let board = await db.board.findOne({where: {id: workItem.idBoard}});

  const files = await uploadHelper.uploadMultiple(req, res, `${board.idWorkspace}/${workItem.idBoard}/${workItem.id}/workitem-file`);

  let user = req.locals.user;

  if (!workItem) return errorHelper.notFound(res);

  const newFiles = [];
  for(let file of files) {
    const dbFile = await db.workItemFile.create({
        idWorkItem: workItem.id,
        name: file.name,
        url: file.url,
        mimeType: file.mimeType,
        status: ObjectStatus.Active,
        createdBy: user.id
    });

    newFiles.push(dbFile);
  }

  await db.workItemAction.create({
    idWorkItem: workItem.id,
    updateType: UpdateType.WorkItemFilesAdded,
    idBoard: workItem.idBoard,
    idWorkspace: board.idWorkspace,
    meta: {title: workItem.title},
    createdBy: user.id
  });

  return res.send(newFiles);

}));

router.delete('/:idWorkItem/file/:idFile', utilities.promiseCatch(async function (req, res) {
  let workItem = await checkBoardAccessAndGetWI(req, res);
  if(!workItem) return;

  const user = req.locals.user;
  const idFile = +req.params.idFile;

  if (!workItem) return errorHelper.notFound(res);

  const file = await db.workItemFile.findOne({where: {id: idFile, status: ObjectStatus.Active}});

  if (!file) return errorHelper.notFound(res);
  if(file.createdBy !== user.id) return errorHelper.respondWithCode('USER_NOT_CREATOR', res);

  file.status = ObjectStatus.Deleted;
  file.save();

  return res.send({});
}));

async function deleteChildren(idWI, tx) {
  //todo: use query to delete!
  let childList = await db.workItem.findAll({attributes: ['id'], where: {idParent: idWI}});
  for (let wi of childList) {
    wi.status = ObjectStatus.Deleted;
    await wi.save({tx});

    deleteChildren(wi.id, tx);
  }
}

router.delete('/:idWorkItem', utilities.promiseCatch(async function (req, res) {
  let workItem = await checkBoardAccessAndGetWI(req, res);
  if(!workItem) return;

  const user = req.locals.user;
  const idWorkspace = +req.params.idWorkspace;

  if (!workItem) return errorHelper.notFound(res);

  let tx = null;
  try {
    tx = await db.raw.transaction();
    workItem.status = ObjectStatus.Deleted;
    await workItem.save({tx});

    //delete child items as well
    await deleteChildren(workItem.id, tx);

    await db.workItemAction.create({
      idWorkItem: workItem.id,
      updateType: UpdateType.WorkItemDeleted,
      idBoard: workItem.idBoard,
      idWorkspace: idWorkspace,
      meta: {title: workItem.title},
      createdBy: user.id
    }, {tx});

    await tx.commit();
  }
  catch (err) {
    logger.error('error deleteing nest: ', err);
    tx.rollback();

    return errorHelper.respondWithCode('CANNOT_DELETE', res);
  }

  webSocket.pushEvent('workItemDeleted', {
    idBoard: workItem.idBoard,
    idNest: workItem.idNest,
    id: workItem.id,
    title: workItem.title
  });

  return res.send({});
}));

async function checkBoardAccessAndGetWI(req, res) {
  let idBoard = +req.params.idBoard;
  let idWI = +req.params.idWorkItem;

  let user = req.locals.user;

  const canWriteBoard = await securityHelper.canWriteBoard(idBoard, user.id);

  if (!canWriteBoard) return errorHelper.readonly(res);

  return db.workItem.findOne({where: {id: idWI, idBoard: idBoard}});
}

function isFieldValid(fieldConfig, fieldValue) {
  //switch(fieldConfig.type) {
  //  case '':
  //
  //    break;
  //}
  return true;
}

async function getUserList(boardAccessType, idWorkspace, idBoard) {
  if (boardAccessType === 0) { //inherit from workspace users
    return db.raw.query('select u2w.role, u.id,u.name, u.email, u."imageUrl" img from user2workspace u2w inner join "user" u on u.id=u2w."idUser" where u2w."idWorkspace"=:idWk', {
      replacements: {idWk: idWorkspace},
      type: sequelize.QueryTypes.SELECT
    });
  }
  else {
    return db.raw.query('select u2b.role, u.id,u.name, u.email, u."imageUrl" img from user2board u2b inner join "user" u on u.id=u2b."idUser" where u2b."idBoard"=:idBoard', {
      replacements: {idBoard: idBoard},
      type: sequelize.QueryTypes.SELECT
    });
  }
}

async function findBoardUser(boardAccessType, idWorkspace, idBoard, idUser) {
  let res = null;
  if (boardAccessType === 0) { //inherit from workspace users
    res = await db.raw.query('select u2w.role, u.id,u.name, u.email from user2workspace u2w inner join "user" u on u.id=u2w."idUser" where u2w."idWorkspace"=:idWorkspace and u.id=:idUser', {
      replacements: {idWorkspace: idWorkspace, idUser: idUser},
      type: sequelize.QueryTypes.SELECT
    });
  }
  else {
    res = await db.raw.query('select u2b.role, u.id,u.name, u.email from user2board u2b inner join "user" u on u.id=u2b."idUser" where u2b."idBoard"=:idBoard and u.id=:idUser', {
      replacements: {idBoard: idBoard, idUser: idUser},
      type: sequelize.QueryTypes.SELECT
    });
  }


  return res.length > 0 ? res[0] : null;
}

module.exports = router;
