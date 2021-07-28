'use strict';

const router = require('express').Router({mergeParams: true});

const slugify = require('slugify');

const db = require('../db/models');
const utilities = require('../utilities');

const logger = require('../logger');
const errorHelper = require('../error-helper');
const securityHelper = require('../security-helper');
const orderHelper = require('../order-helper');

const boardTemplateHelper = require('../common/board-template-helper');

const appConfig = require('../../config').getCurrent();

const FIELD_TYPE_TITLE = 'TITLE';

const ObjectStatus = require('../common/status-enum');
const BoardType = require('../common/board-type-enum');

router.all('*', utilities.promiseCatch(async function (req, res, next) {
  if (!req.locals.user) return errorHelper.unauth(res);

  //need board for all operations
  if (!req.params.idWorkspace) {
    return errorHelper.notFound(res);
  }

  const canReadWorkspace = await securityHelper.canReadWorkspace(+req.params.idWorkspace, req.locals.user.id);
  if (!canReadWorkspace) return errorHelper.notFound(res);

  req.locals.boardType = BoardType.Board;
  if (req.originalUrl.indexOf('/goal') > -1) {
    req.locals.isGoal = true;
    req.locals.boardType = BoardType.Goal;
  }

  next();
}));

router.get('/list', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  const user = req.locals.user;

  const wk = await db.workspace.findById(idWorkspace);
  if(wk.status !== ObjectStatus.Active)
    return errorHelper.notFound(res);

  let boardIdList = await securityHelper.getBoardIdList(idWorkspace, req.locals.user.id);
  const workspaceRight = await securityHelper.getWorkspaceRight(idWorkspace, user.id);

  if (user.lastWorkspaceId !== idWorkspace) {
    user.lastWorkspaceId = idWorkspace;
    await user.save();
  }

  let folderList = await db.boardFolder.findAll({
    attributes: ['id', 'name', 'order', 'idParent'],
    where: {idWorkspace: idWorkspace, status: ObjectStatus.Active, boardType: req.locals.boardType},
    raw: true
  });

  let boardList = [];

  if(boardIdList.length > 0) {
    boardList = await db.select(`
  select b.id, b.name, b.order, b.description, b."idFolder", b."doneField", b."doneValue", b."boardAccessType", b."dueDate", u2b.role 
  from board b left join user2board u2b on b.id=u2b."idBoard" and u2b."idUser"=:idUser 
where b."idWorkspace"=:idWorkspace and b.id in (:boardIds) and b.status=:status and b."boardType"=:boardType`,
      {
        idWorkspace: idWorkspace,
        status: ObjectStatus.Active,
        idUser: user.id,
        boardType: req.locals.boardType,
        boardIds: boardIdList
      }
    );

    const defaultBoardCount = {};
    boardIdList.forEach((idB) => {
      defaultBoardCount[idB] = 0;
    });

    const boardNotifCount = await db.select(`
  SELECT count(*) cnt, wia."idBoard" 
from "workItemAction" wia 
left join "user2board" u2b on u2b."idUser"=:idUser and u2b."idBoard"=wia."idBoard"
where wia."idBoard" in (:boardIds) and (wia."createdAt">u2b."lastNotificationRead" or u2b."lastNotificationRead" is null) group by wia."idBoard"`, {
        boardIds: boardIdList,
        idUser: user.id
    });

    for (let boardNotif of boardNotifCount) {
      defaultBoardCount[boardNotif.idBoard] = boardNotif.cnt;
    }

    for (let b of boardList) {
      b.changeCount = defaultBoardCount[b.id];

      if(!b.role || b.boardAccessType === 0) b.role = workspaceRight;

      if(req.locals.boardType === BoardType.Goal) {
        const board = await db.board.findById(b.id);

        const wiList = await db.select(`select id, data from "workItem" where "idBoard"=${b.id} and status=${ObjectStatus.Active}`);
        const boardData = JSON.parse(board.dataStructure);

        let doneCount = 0;
        const progression = {};
        const goalStatuses = {};

        if(boardData && boardData.find) {
          let doneValue = board.doneValue;

          let doneField = null;
          if(board.doneField) doneField = boardData.find(b => b.id === board.doneField);
          else doneField = boardData.find(b => b.type === 'percentage');

          if (doneField) {
            if(doneField.type === 'percentage') doneValue = 100;

            for (let wi of wiList) {
              const data = JSON.parse(wi.data);
              const isWiDone = data && data[doneField.id] === doneValue;
              if (data && isWiDone) {
                doneCount++;
              }

              goalStatuses[wi.id] = (data || {})[doneField.id];
            }

            const doneHistoryList = await db.select(`select wia."idWorkItem", wia."createdBy",wia."createdAt" from "workItemAction" wia, json_array_elements((wia.meta #> '{fields}')::json) fld
where wia."idBoard"=:idBoard and wia."updateType"=3
and fld->>'idField'=:idField and fld->>'newValue'='100' 
order by wia."createdAt" asc
`, {
              idField: doneField.id,
              idBoard: b.id
            });

            for (let wiDone of doneHistoryList) {
              progression[wiDone.idWorkItem] = wiDone.createdAt;
            }
          }
        }

        b.goalData = {
          total: wiList.length,
          done: doneCount,
          effortArr: progression,
          goalStatuses: goalStatuses
        }
      }
    }
  }

  return res.send({boardList: boardList, folderList: folderList});
}));

router.post('/', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let user = req.locals.user;

  if (!(await securityHelper.canAddBoard(idWorkspace, req.locals.user.id))) return errorHelper.readonly(res);

  let name = req.body.name;
  let description = req.body.description;
  let status = +req.body.status || ObjectStatus.Active;
  let boardAccessType = +req.body.boardAccessType || ObjectStatus.Active;
  let idTemplate = +req.body.idTemplate || null;
  let idTemplateCategory = +req.body.idTemplateCategory || null;
  const dueDate = req.body.dueDate;
  const withWorkItems = req.body.withWorkItems;

  const boardType = req.locals.isGoal ? BoardType.Goal : BoardType.Board;

  if (!name) return errorHelper.respondWithCode('NAME_REQUIRED', res);

  let nextOrder = ((await db.board.max('order', {
    where: {
      idWorkspace: idWorkspace
    }
  })) || 0) + 1;

  let templateItems = null;
  let tx = null;
  try {
    tx = await db.raw.transaction();

    let boardData = null;
    if (idTemplate) {

      if(idTemplateCategory === -2) { //user template
        const tpl = await db.boardTemplate.findById(idTemplate);
        boardData = tpl.data;
        templateItems = JSON.parse(tpl.items);
      }
      else { // template workspace!
        const tplBoard = await db.board.findOne({ where: { id: idTemplate, idWorkspace: appConfig.templateWorkspaceId }, raw: true});
        if(!tplBoard) return errorHelper.notFound(res);

        name = tplBoard.name;
        description = tplBoard.description;
        idTemplate = tplBoard.id;
        boardData = tplBoard.dataStructure;
        boardAccessType = 0; //don't clone users / permissions. no access to them in other workspaces!!!
        templateItems = await boardTemplateHelper.buildNestsStructure(tplBoard, withWorkItems);
      }
    }
    else if(boardType === BoardType.Goal) {
      //goal: default template used is name: 'Goal structure'
      const tpl = await db.board.findOne({where: { idWorkspace: appConfig.templateWorkspaceId, name: 'Goal structure', boardType: BoardType.Goal}, raw: true});
      if(tpl) {
        boardData = tpl.dataStructure;
      }
      else {
        logger.warn('Cannot find default goal template "Goal structure" to use..');
      }
    }

    let newBoard = await db.board.create({
      name: name,
      urlName: slugify(name),
      description: description,
      idWorkspace: idWorkspace,
      idTemplate: null,
      dataStructure: boardData,
      order: nextOrder,
      status: status,
      boardAccessType: boardAccessType,
      createdBy: user.id,
      boardType: boardType,
      dueDate: dueDate
    }, {tx});

    let defaultNestId = null;
    console.log('template items: ', templateItems);
    if(templateItems) { // restore nests / items from template!
      for(let tplNest of templateItems) {
        const nest = await db.nest.create({
          name: tplNest.name,
          color: tplNest.color,
          order: tplNest.order,
          createdBy: user.id,
          idBoard: newBoard.id
        }, {tx});

        if(withWorkItems && tplNest.items) {
          for(let tplWi of tplNest.items) {
            console.log('creating wi: ', tplWi);
            await createItemWithChildren(null, tplWi, nest, newBoard, user, tx);
          }
        }

        if(tplNest.defaultNest) defaultNestId = nest.id;
      }
    }
    else {
      let newNest = await db.nest.create({name: 'Default Nest', idBoard: newBoard.id, color: 'black', order: 1}, {tx});
      defaultNestId = newNest.id;
    }

    newBoard.idDefaultNest = defaultNestId;
    await newBoard.save({tx});

    //also add
    await db.user2board.create({idUser: user.id, idBoard: newBoard.id}, {tx});

    //clone permissions from prev board? NO!

    tx.commit();

    return res.send({id: newBoard.id});
  }
  catch (ex) {
    tx && tx.rollback();

    logger.error('cannot create board: ', ex);

    return errorHelper.getError('CANNOT_SAVE', res);
  }
}));

router.post('/folder', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let user = req.locals.user;

  const canAddBoard = await securityHelper.canAddBoard(idWorkspace, req.locals.user.id);
  if (!canAddBoard) return errorHelper.readonly(res);

  const name = req.body.name;
  const idParent = +req.body.idParent;
  if (!name) return errorHelper.respondWithCode('NAME_REQUIRED', res);

  let nextOrder = ((await db.boardFolder.max('order', {
    where: {
      idWorkspace: idWorkspace
    }
  })) || 0) + 1;

  if (idParent) {
    const parentFolder = await db.boardFolder.findOne({where: {id: idParent, idWorkspace: idWorkspace}});
    if (!parentFolder) return errorHelper.notFound(res, 'PARENT_FOLDER_NOT_FOUND');
  }

  let newBoardFolder = await db.boardFolder.create({
    name: name,
    idWorkspace: idWorkspace,
    idParent: idParent || null,
    order: nextOrder,
    status: 0,
    createdBy: user.id,
    boardType: req.locals.boardType
  });

  return res.send({id: newBoardFolder.id});
}));

router.post('/:id/add-field', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;

  const canChangeBoard = await securityHelper.canModifyBoard(idBoard, user.id);
  if (!canChangeBoard) return errorHelper.readonly(res);

  let fieldType = req.body.type;
  let fieldName = req.body.name;

  if (DATA_TYPES.indexOf(fieldType) === -1) {
    return errorHelper.notFound(res);
  }

  let existingBoard = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace}});

  let structure = existingBoard.dataStructure || '[]';
  let json = JSON.parse(structure);

  let newFieldConfig = getFieldConfig(fieldType, fieldName, json, req.body);
  if (newFieldConfig.errCode) {
    return errorHelper.respondWithCode(newFieldConfig.errCode, res);
  }
  else {
    console.log('new field', newFieldConfig);
  }

  // assign unique ID
  let fieldWithIdExists = true;
  let id = '';
  while (fieldWithIdExists) {
    id = utilities.random(5);
    fieldWithIdExists = json.some(f => f.id === id);
  }

  let maxOrder = 0;
  if (json.length > 0) {
    json.forEach((field) => {
      maxOrder = Math.max(maxOrder, field.order);
    });
  }
  let newOrder = (maxOrder || 0) + 1;

  newFieldConfig.id = id;
  newFieldConfig.order = newOrder;
  json.push(newFieldConfig);

  existingBoard.dataStructure = JSON.stringify(json);
  await existingBoard.save();

  return res.send({id: newFieldConfig.id, title: fieldName, order: newOrder});

}));

router.put('/folder/:id', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let user = req.locals.user;
  let id = req.params.id;

  if (!securityHelper.canAddBoard(idWorkspace, user.id)) return errorHelper.readonly(res);

  const name = req.body.name;
  const idParent = +req.body.idParent;
  const newOrder = +req.body.order;

  let existingFolder = await db.boardFolder.findOne({where: {id: id, idWorkspace: idWorkspace}});

  if (!existingFolder) {
    return errorHelper.notFound(res);
  }

  if (name) {
    existingFolder.name = name;
  }
  if (idParent) {
    const parentFolder = await db.boardFolder.findOne({where: {id: idParent, idWorkspace: idWorkspace}});
    if (!parentFolder) return errorHelper.notFound(res, 'PARENT_FOLDER_NOT_FOUND');

    existingFolder.idParent = idParent;
  }
  else if (req.body.idParent === null) {
    existingFolder.idParent = null;
  }

  if (newOrder) {
    let oldOrder = existingFolder.order;

    await orderHelper.changeOrder(oldOrder, newOrder, 'boardFolder', '"idWorkspace"=:idWorkspace', {idWorkspace: idWorkspace});

    existingFolder.order = newOrder;
  }

  existingFolder.save();

  return res.send({});
}));

router.put('/:id/clone', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;
  const idFolder = +req.body.idFolder || null;

  const boardType = req.locals.isGoal ? BoardType.Goal : BoardType.Board;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  const board = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace, boardType: boardType}});

  if(!board) return errorHelper.notFound(res);

  const name = req.body.name || board.name + ' clone';

  let nextOrder = ((await db.board.max('order', {
    where: {
      idWorkspace: idWorkspace
    }
  })) || 0) + 1;

  let tx = null;
  try {
    tx = await db.raw.transaction();

    const newBoard = await db.board.create({
      name: name,
      description: board.description,
      idTemplate: board.idTemplate,
      order: nextOrder,
      status: board.status,
      boardType: board.boardType,
      boardAccessType: board.boardAccessType,
      dataStructure: board.dataStructure,
      idWorkspace: board.idWorkspace,
      idFolder: idFolder,
      createdBy: user.id
    }, {tx});

    //clone nests
    const nestMap = {};
    const nestList = await db.nest.findAll({where: {idBoard: board.id, status: ObjectStatus.Active}});
    for (let n of nestList) {
      let clonedNest = await db.nest.create({
        name: n.name,
        idBoard: newBoard.id,
        color: n.color,
        order: n.order,
        status: ObjectStatus.Active,
        createdBy: user.id,
      }, {tx});
      nestMap[n.id] = clonedNest.id;
    }

    newBoard.idDefaultNest = nestMap[board.idDefaultNest];
    await newBoard.save({tx});

    //clone items
    const wiMap = {};
    const workItemList = await db.workItem.findAll({
      where: {idBoard: board.id, status: ObjectStatus.Active},
      order: [['idParent', 'DESC']]
    });
    for (let wi of workItemList) {
      const newWI = await db.workItem.create({
        title: wi.title,
        description: wi.description,
        order: wi.order,
        status: ObjectStatus.Active,
        data: '{}',
        externalUrl: wi.externalUrl,
        idNest: nestMap[wi.idNest],
        idBoard: newBoard.id,
        idParent: wiMap[wi.idParent],
        idClient: wi.idClient,

        createdBy: user.id,
        lastSyncDate: wi.lastSyncDate
      }, {tx});
      wiMap[wi.id] = newWI.id;
    }

    //clone security
    const secList = await db.user2board.findAll({where: {idBoard: board.id}});
    for (let sec of secList) {
      await db.user2board.create({idBoard: newBoard.id, idUser: sec.idUser, role: sec.role});
    }

    await tx.commit();

    res.send({id: newBoard.id, name: newBoard.name, order: newBoard.order, role: 'a', idFolder: newBoard.idFolder});
  }
  catch (err) {
    logger.error(err);
    tx && tx.rollback();
  }

}));

router.put('/:id', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;
  const dueDate = req.body.dueDate;

  if (!(await securityHelper.canModifyBoard(idBoard, user.id))) return errorHelper.readonly(res);

  let name = req.body.name;
  let description = req.body.description;
  let idFolder = req.body.idFolder;
  let newOrder = +req.body.order;
  const doneField = req.body.doneField;
  const doneValue = req.body.doneValue;

  const boardType = req.locals.isGoal ? BoardType.Goal : BoardType.Board;

  let existingBoard = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace, boardType: boardType}});

  if (!existingBoard) return errorHelper.notFound(res);

  existingBoard.name = name || existingBoard.name;
  existingBoard.description = description || existingBoard.description;

  existingBoard.doneField = doneField;
  existingBoard.doneValue = doneValue;

  if(req.locals.isGoal && dueDate) {
    existingBoard.dueDate = dueDate;
  }

  existingBoard.dueDate = dueDate;

  if (existingBoard.idFolder && idFolder === null) {
    existingBoard.idFolder = null;
  }
  else if (+idFolder) {
    let existingFolder = await db.boardFolder.findOne({where: {id: +idFolder, idWorkspace: idWorkspace}});
    if (existingFolder) {
      existingBoard.idFolder = +idFolder;
    }
    else {
      return errorHelper.notFound(res, 'FOLDER_NOT_FOUND');
    }
  }

  if (newOrder) {
    let oldOrder = existingBoard.order;

    await orderHelper.changeOrder(oldOrder, newOrder, 'board', '"idWorkspace"=:idWorkspace', {idWorkspace: idWorkspace});

    existingBoard.order = newOrder;
  }

  await existingBoard.save();

  return res.send({});
}));

router.put('/:id/field/:idField', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let idField = req.params.idField;

  let newName = req.body.name;
  let newMeta = req.body.meta;
  let newVisibility = req.body.visibility;
  let newOrder = null;
  if(req.body.order !== undefined)
    newOrder = +req.body.order;

  let user = req.locals.user;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  let existingBoard = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace}});
  if (!existingBoard) {
    return errorHelper.notFound(res, 'BOARD_NOT_FOUND');
  }

  let structure = existingBoard.dataStructure || '[]';
  let json = JSON.parse(structure);

  let field = json.find(a => a.id === idField);
  if (!field) {
    if (idField === FIELD_TYPE_TITLE) {
      field = {id: idField};
      json.push(field);
    }
    else return errorHelper.notFound(res, 'FIELD_NOT_FOUND');
  }

  if (newName) {
    field.name = newName;
  }
  if (newMeta) {
    field.meta = newMeta;

    console.log('meta: ', newMeta);
  }
  if (newVisibility) {
    field.visibility = newVisibility;
  }
  let oldOrder = field.order;
  if (newOrder != null && oldOrder !== newOrder) {
    //update field order
    field.order = newOrder - 0.1;

    //reoder to remove gaps
    let idx = 0;
    for (let fld of json.sort((a, b) => a.order - b.order)) {
      fld.order = idx++;
    }

    field.order = newOrder;
  }

  existingBoard.dataStructure = JSON.stringify(json);
  await existingBoard.save();

  return res.send({});

}));

router.post('/:id/field/:idField/clone', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let idField = req.params.idField;

  let user = req.locals.user;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  let existingBoard = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace}});
  if (!existingBoard) {
    return errorHelper.notFound(res, 'BOARD_NOT_FOUND');
  }

  let structure = existingBoard.dataStructure || '[]';
  let json = JSON.parse(structure);

  let field = json.find(a => a.id === idField);
  if (!field) {
    if (idField === FIELD_TYPE_TITLE) {
      field = {id: idField};
      json.push(field);
    }
    else return errorHelper.notFound(res, 'FIELD_NOT_FOUND');
  }

  const clonedField = Object.assign({}, field);
  let fieldWithIdExists = true;
  let id = '';
  while (fieldWithIdExists) {
    id = utilities.random(5);
    fieldWithIdExists = json.some(f => f.id === id);
  }

  let maxOrder = 0;
  if (json.length > 0) {
    json.forEach((field) => {
      maxOrder = Math.max(maxOrder, field.order);
    });
  }
  let newOrder = (maxOrder || 0) + 1;

  clonedField.id = id;
  clonedField.order = newOrder;
  json.push(clonedField);

  existingBoard.dataStructure = JSON.stringify(json);
  await existingBoard.save();

  return res.send({id: clonedField.id});

}));

router.post('/:id/search', utilities.promiseCatch(async function (req, res) {
  let id = req.params.id;
  let idWk = req.params.idWorkspace;

  let q = req.body.q;
  let item = req.body.item;
  let board = req.body.board;
  let nest = req.body.nest;


//   let qry = `
// SELECT searchq.id, searchq.title,
//   searchq."idNest",searchq."idBoard", searchq."boardName", searchq."nestName"
// FROM (SELECT wi.id,
//              wi.title,
//              wi."idNest",
//              wi."idBoard",
//              b.name "boardName",
//              n.name "nestName",
//              setweight(to_tsvector('english'::regconfig, wi.title), 'A') ||
//              setweight(to_tsvector('english'::regconfig, coalesce(wi.description)), 'B') as document
//       FROM  "workItem" wi
//         inner join board b on b.id=wi."idBoard" and b."idWorkspace"=:idWk
//         inner join nest n on n.id=wi."idNest"
//       ) searchq
// WHERE searchq.document @@ plainto_tsquery('english', :q)
// ORDER BY ts_rank(searchq.document, plainto_tsquery('english', :q)) DESC LIMIT 20;`;

  let result = [];

  if(q) {
    const qry = `
select * from (
    SELECT wi.id id, wi.title title, wi."idNest", wi."idBoard", b.name "boardName", n.name "nestName", 'work-item' "type"
     FROM  "workItem" wi 
        inner join board b on b.id=wi."idBoard" and b."idWorkspace"=:idWk and b."status"=${ObjectStatus.Active}
        inner join nest n on n.id=wi."idNest" and n."status"=${ObjectStatus.Active}
      where wi.status=${ObjectStatus.Active} and wi.title ilike :q 
     
    union
    
    SELECT null id, null title, n.id, n."idBoard", b.name "boardName", n.name "nestName", 'nest' "type"
     FROM  nest n
          inner join board b on b.id=n."idBoard" and b."idWorkspace"=:idWk and b."status"=${ObjectStatus.Active}
        where n.status=${ObjectStatus.Active} and n.name ilike :q
  
    union
  
    SELECT null id, null title, null "idNest", b.id, b.name "boardName", null "nestName" , 'board' "type"
     FROM  board b
        where b.status=${ObjectStatus.Active} and b.name ilike :q and b."idWorkspace"=:idWk
    union
    
    SELECT bf.id id, bf.name title, null "idNest", null id, null "boardName", null "nestName", 'folder' "type"
      FROM "boardFolder" bf where bf."idWorkspace"=:idWk and bf.name ilike :q
      
  ) res
  order by char_length(coalesce(res.title, '') || coalesce(res."boardName", '') || coalesce(res."nestName", '')) asc LIMIT 20;
    `;
    result = await db.select(qry, {
      q: `%${q}%`,
      idWk: idWk
    });
  }
  else if(item) {
    const qry = `SELECT wi.id, wi.title,
  wi."idNest", wi."idBoard", b.name "boardName", n.name "nestName" 
   FROM  "workItem" wi 
        inner join board b on b.id=wi."idBoard" and b."idWorkspace"=:idWk and b."status"=${ObjectStatus.Active}
        inner join nest n on n.id=wi."idNest" and n."status"=${ObjectStatus.Active}
      where wi.status=${ObjectStatus.Active} and wi.title ilike :q order by wi.order DESC LIMIT 20;
    `;
    result = await db.select(qry, {
      q: `%${item}%`,
      idWk: idWk
    });
  }
  else if(nest) {
    const qry = `SELECT n.name "nestName", n.id, n."idBoard", b.name "boardName"
   FROM  nest n 
        inner join board b on b.id=n."idBoard" and b."idWorkspace"=:idWk and b."status"=${ObjectStatus.Active}
      where n.status=${ObjectStatus.Active} and n.name ilike :q order by n.order DESC LIMIT 20;
    `;
    result = await db.select(qry, {
      q: `%${nest}%`,
      idWk: idWk
    });
  }
  else if(board) {
    const qry = `SELECT b.id, b.name "boardName" 
   FROM board b 
      where b.status=${ObjectStatus.Active} and b.name ilike :q order by b.order DESC LIMIT 20;
    `;
    result = await db.select(qry, {
      q: `%${board}%`,
      idWk: idWk
    });
  }

  return res.send(result);
}));

router.get('/:id', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;

  if (!securityHelper.canReadBoard(idBoard, user.id)) return errorHelper.unauth(res);

  let existingBoard = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace}});

  if (!existingBoard) {
    return errorHelper.notFound(res);
  }

  let items = await db.workItem.find({attributes: ['id', 'title', 'description'], where: {idBoard: idBoard}});

  res.send({
    id: existingBoard.id,
    name: existingBoard.name,
    descriptions: existingBoard.description,
    items: items
  });
}));

router.get('/:id/users', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  const boardTypeToGet = req.locals.isGoal ? BoardType.Goal : BoardType.Board;

  const board = await db.board.findOne({
    attributes: ['boardAccessType'],
    where: {id: idBoard, status: ObjectStatus.Active, boardType: boardTypeToGet},
    raw: true
  });

  if (!board) return errorHelper.notFound(res);

  const resultObj = {
    boardAccessType: board.boardAccessType,
    currentMembers: [],
    allMembers: []
  };

  resultObj.allMembers = await db.select('select u.id,u.name,u.email, u2w.role, u."imageUrl" from "user" u inner join user2workspace u2w on u2w."idUser"=u.id where u2w."idWorkspace"=:idWorkspace',
    {idWorkspace: idWorkspace}
  );

  if (board.boardAccessType !== 0) {
    resultObj.currentMembers = await db.select('select u.id,u.name,u.email, u2b.role, u."imageUrl" from "user" u inner join user2board u2b on u2b."idUser"=u.id where u2b."idBoard"=:idBoard and u2b.role is not null',
      {idBoard: idBoard}
    );
  }
  else {
    //resultObj.currentMembers = resultObj.allMembers.slice();
  }
  return res.send(resultObj);
}));

router.get('/:id/fields', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;

  if (!securityHelper.canReadBoard(idBoard, user.id)) return errorHelper.unauth(res);

  const boardTypeToGet = req.locals.isGoal ? BoardType.Goal : BoardType.Board;

  const board = await db.board.findOne({
    attributes: ['boardAccessType', 'dataStructure'],
    where: {id: idBoard, status: ObjectStatus.Active, boardType: boardTypeToGet},
    raw: true
  });

  if (!board) return errorHelper.notFound(res);

  return res.send(JSON.parse(board.dataStructure));
}));

router.get('/:id/nests', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;

  if (!securityHelper.canReadBoard(idBoard, user.id)) return errorHelper.unauth(res);

  const boardTypeToGet = req.locals.isGoal ? BoardType.Goal : BoardType.Board;

  const board = await db.board.findOne({
    attributes: ['idDefaultNest'],
    where: {id: idBoard, status: ObjectStatus.Active, boardType: boardTypeToGet},
    raw: true
  });

  const nestList = await db.nest.findAll({
    attributes: ['id', 'name'],
    where: {idBoard: idBoard, status: ObjectStatus.Active},
    raw: true
  });

  for(let nest of nestList) {
    if(nest.id === board.idDefaultNest) {
      nest.isDefault = true;
    }
  }

  return res.send(nestList);
}));

router.put('/:id/users', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  const boardTypeToGet = req.locals.isGoal ? BoardType.Goal : BoardType.Board;

  const board = await db.board.findOne({
    attributes: ['id', 'boardAccessType'],
    where: {id: idBoard, status: ObjectStatus.Active, boardType: boardTypeToGet}
  });

  if (!board) return errorHelper.notFound(res);

  const members = req.body.members;
  const hasOwnSecurity = req.body.hasOwnSecurity;

  if(hasOwnSecurity) {
    //insert or update each member
    board.boardAccessType = 1;
    await board.save();

    for(let m of members) {
      const exM = await db.user2board.findOne({
        where: {idUser: m.id, idBoard: board.id}
      });
      if(!exM && !m.deleted) {
        await db.user2board.create({
          idUser: m.id,
          idBoard: board.id,
          role: m.role,
          lastNotificationRead: null
        });
      }
      else if(exM) {
        if(m.deleted) exM.role = null;
        else exM.role = m.role;

        await exM.save();
      }
    }
  }
  else {

  }

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  return res.send({});
}));

router.delete('/:id/field/:idField', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let idField = req.params.idField;

  let user = req.locals.user;
  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);
  let existingBoard = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace}});
  if (!existingBoard) {
    return errorHelper.notFound(res, 'BOARD_NOT_FOUND');
  }

  let structure = existingBoard.dataStructure || '[]';
  let json = JSON.parse(structure);

  let field = json.find(a => a.id === idField);
  if (!field) {
    return errorHelper.notFound(res, 'FIELD_NOT_FOUND');
  }

  json.splice(json.indexOf(field), 1);
  //todo raul: soft delete for field!
  //field.isDeleted = true;

  //update order
  let idx = 1;
  for (let fld of json.sort((a, b) => a.order - b.order)) {
    fld.order = idx;
    idx++;
  }

  existingBoard.dataStructure = JSON.stringify(json);
  await existingBoard.save();

  return res.send({});

}));

router.delete('/:id', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoard = +req.params.id;
  let user = req.locals.user;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  let existingBoard = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace}});

  if (!existingBoard) {
    return errorHelper.respondWithCode('BOARD_NOT_FOUND', res);
  }

  existingBoard.status = ObjectStatus.Deleted;

  await existingBoard.save();

  return res.send({});

}));

router.delete('/folder/:id', utilities.promiseCatch(async function (req, res) {
  let idWorkspace = req.params.idWorkspace;
  let idBoardFolder = +req.params.id;
  let user = req.locals.user;

  if (!securityHelper.canAddBoard(idWorkspace, user.id)) return errorHelper.readonly(res);

  let existingBoardFolder = await db.boardFolder.findOne({where: {id: idBoardFolder, idWorkspace: idWorkspace}});

  if (!existingBoardFolder) {
    return errorHelper.respondWithCode('BOARDFOLDER_NOT_FOUND', res);
  }

  let boardsInsideFolder = await db.board.count({
    where: {
      idWorkspace: idWorkspace,
      idFolder: existingBoardFolder.id,
      status: ObjectStatus.Active
    }
  });
  if (boardsInsideFolder > 0) {
    return errorHelper.respondWithCode('BOARDFOLDER_NOT_EMPTY', res);
  }

  existingBoardFolder.status = ObjectStatus.Deleted;

  await existingBoardFolder.save();

  return res.send({});

}));

router.get('/:id/changes/:pageNum', utilities.promiseCatch(async function (req, res) {
  const idBoard = +req.params.id;
  const pageNum = +req.params.pageNum || 0;
  const idWorkspace = +req.params.idWorkspace;

  let board = await db.board.findOne({where: {id: idBoard}});

  if (!board) {
    return errorHelper.respondWithCode('BOARD_NOT_FOUND', res);
  }

  console.log('board', idBoard);

  const metaArray = JSON.parse(board.dataStructure);

  const changes = await db.select(`SELECT c.id, c."idWorkItem", c."updateType", c.meta, c."createdBy", c."createdAt", u.name,u."imageUrl" from "workItemAction" c 
inner join "user" u on u.id=c."createdBy"
where c."idBoard"=:idBoard 
order by c."createdAt" desc
LIMIT 20 OFFSET ${(pageNum * 20)}`,
    { idBoard: idBoard });

  const boardUsers = await db.select(`select distinct u.id, u.name from "user" u inner join "user2workspace" u2w on u.id=u2w."idUser" where u2w."idWorkspace"=${idWorkspace}`);
  const userDict = {};
  for(let u of boardUsers) {
    userDict[u.id] = u.name;
  }

  //update user last change see
  const user = req.locals.user;
  const u2b = await db.user2board.findOne({where: {idUser: user.id, idBoard: idBoard}});
  if (!u2b) {
    await db.user2board.create({idUser: user.id, idBoard: idBoard, lastNotificationRead: new Date()});
  }
  else {
    u2b.lastNotificationRead = new Date();
    await u2b.save();
  }

  const changesToSend = changes.map(c => {

    const change = {
      id: c.id,
      idWorkItem: c.idWorkItem,
      idBoard: idBoard,
      updateType: c.updateType,
      createdAt: c.createdAt,
      meta: c.meta,
      user: {id: c.createBy, name: c.name, img: c.imageUrl},
    };

    if (change.meta.fields) {
      for (let changedField of change.meta.fields) {
        const foundField = metaArray.find(f => f.id === changedField.idField);

        if (foundField) {
          changedField.fieldName = foundField.name;


          if (foundField.originalType === 'selector') {
            let old = foundField.meta.find(m => m.id === changedField.oldValue);
            if (old) changedField.oldValueName = old.label;
            else changedField.oldValueName = '[ no label ]';

            let nw = foundField.meta.find(m => m.id === changedField.newValue);
            if (nw) changedField.newValueName = nw.label;
            else changedField.newValueName = '[ no label ]';
          }
          else if(foundField.originalType === 'person') {
            let old = userDict[changedField.oldValue];
            if (old) changedField.oldValueName = old;
            else changedField.oldValueName = '[ none ]';

            let nw = userDict[changedField.newValue];
            if (nw) changedField.newValueName = nw;
            else changedField.newValueName = '[ none ]';
          }
        }
        else {
          logger.warn('change on field not found', changedField);
        }
      }
    }

    return change;
  });

  return res.send(changesToSend);
}));

function getFieldConfig(fieldType, fieldName, json, bodyOpts) {

  const opts = {};
  if (fieldType === 'comment' && json.some(f => f.type === 'comment')) { //can only allow 1 comment
    return {errCode: 'COMMENT_ENABLE_ONCE'};
  }
  else if (fieldType === 'file' && json.some(f => f.type === 'file')) { //can only allow 1 comment
    return {errCode: 'FILE_ENABLE_ONCE'};
  }
  else if (fieldType === 'percentage') {
    opts.min = 0;
    opts.max = 100;
  }
  else if (fieldType === 'reminder') {
    opts.title = bodyOpts.title;
    opts.message = bodyOpts.message;
    opts.sendDate = bodyOpts.sendDate;
    opts.people = bodyOpts.people;
    opts.sentDate = null;
  }

  return {
    name: fieldName,
    originalType: fieldType,
    type: ['short-text', 'external-link', 'label', 'tag'].indexOf(fieldType) > -1 ? 'text' : fieldType,
    min: opts.min,
    max: opts.max,
    list: opts.list
  };
}

const DATA_TYPES = ['date', 'number', 'short-text', 'selector', 'person', 'comment', 'timeline', 'external-link', 'percentage', 'dependency', 'label', 'file', 'tag', 'reminder'];

async function createItemWithChildren(idParent, tplWi, nest, board, user, tx) {
  const wi = await db.workItem.create({
    title: tplWi.title,
    description: tplWi.description,
    order: tplWi.order,
    status: ObjectStatus.Active,
    idParent: idParent,
    data: tplWi.data,
    idNest: nest.id,
    idBoard: board.id,
    createdBy: user.id
  }, { tx });

  if(!tplWi.items) return;

  for(let child of tplWi.items) {
    await createItemWithChildren(wi.id, child, nest, board, user, tx);
  }
}

module.exports = router;
