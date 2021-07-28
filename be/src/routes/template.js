'use strict';

const router = require('express').Router({mergeParams: true});

const db = require('../db/models');
const sequelize = require('../db');

const utilities = require('../utilities');

const BoardType = require('../common/board-type-enum');
const ObjectStatus = require('../common/status-enum');

const logger = require('../logger');
const errorHelper = require('../error-helper');
const boardTemplateHelper = require('../common/board-template-helper');

const appConfig = require('../../config').getCurrent();

const securityHelper = require('../security-helper');

router.all('*', function (req, res, next) {
  if (!req.locals.user) return errorHelper.unauth(res);

  //need board for all operations
  if (!req.params.idWorkspace) return errorHelper.notFound(res);

  next();
});

router.get('/list/:type?', utilities.promiseCatch(async function (req, res) {
  const idWorkspace = +req.params.idWorkspace;
  const templateType = req.params.type === 'goal' ? BoardType.Goal : BoardType.Board;

  //let globalList = await db.boardTemplate.findAll({where: {idWorkspace: null, templateType: templateType, status: ObjectStatus.Active }});
  let userTemplateList = await db.boardTemplate.findAll({where: {idWorkspace: idWorkspace, templateType: templateType, status: ObjectStatus.Active }});

  const folderList = await db.select(`select id,name from "boardFolder" where "idWorkspace"=:tplWorkspace and status=${ObjectStatus.Active} and "idParent" is null order by name asc`,
    { tplWorkspace: appConfig.templateWorkspaceId });
  const boardList = await db.select(`select id, name, description, "dataStructure", "idFolder" from board where "idWorkspace"=:tplWorkspace and status=${ObjectStatus.Active} order by name asc`,
    { tplWorkspace: appConfig.templateWorkspaceId });

  //compose result
  const templateResp = [];

  for(let tplFolder of folderList) {
    const folder = { id: tplFolder.id, name: tplFolder.name, templates: boardList.filter(b => b.idFolder === tplFolder.id).map(b => ({ id: b.id, structure: JSON.parse(b.dataStructure), name: b.name, description: b.description })) };

    templateResp.push(folder);
  }
  templateResp.push({ id: -1, name: 'Other templates', templates: boardList.filter(b => b.idFolder === null).map(b => ({ id: b.id, name: b.name, description: b.description, structure: JSON.parse(b.dataStructure) })) });
  templateResp.push({ id: -2, name: 'User templates', templates: userTemplateList.map(b => ({ id: b.id, name: b.name, description: b.description, structure: JSON.parse(b.data) })) });

  return res.send(templateResp);
}));

router.post('/create/:idBoard', utilities.promiseCatch(async function (req, res) {
  const idWorkspace = +req.params.idWorkspace;
  const idBoard = +req.params.idBoard;
  let name = req.body.name;

  const user = req.locals.user;

  const canReadWorkspace = await securityHelper.canReadWorkspace(idWorkspace, user.id);
  if (!canReadWorkspace) return errorHelper.notFound(res);

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  const board = await db.board.findOne({where: {id: idBoard, idWorkspace: idWorkspace}});
  if (!board) return errorHelper.notFound(res, 'BOARD_NOT_FOUND');

  if (!name) {
    name = board.name;
  }

  const itemData = await boardTemplateHelper.buildNestsStructure(board, true);

  const newTemplate = await db.boardTemplate.create({
    name: name,
    idWorkspace: idWorkspace,
    data: board.dataStructure,
    templateType: board.boardType,
    idClient: board.idClient,
    status: ObjectStatus.Active,
    items: itemData
  });

  return res.send({id: newTemplate.id});
}));

router.post('/:id', utilities.promiseCatch(async function (req, res) {
  const idWorkspace = +req.params.idWorkspace;
  const name = req.body.name;
  const id = req.params.id;

  const user = req.locals.user;

  const canReadWorkspace = await securityHelper.canReadWorkspace(idWorkspace, user.id);
  if (!canReadWorkspace) return errorHelper.notFound(res);

  const template = await db.boardTemplate.findOne({where: {id: id, idWorkspace: idWorkspace}});
  if (!template) return res.notFound(res);

  if (name)
    template.name = name;

  await template.save();

  return res.send({});
}));


router.delete('/:id', utilities.promiseCatch(async function (req, res) {
  const idWorkspace = +req.params.idWorkspace;
  const name = req.body.name;
  const id = req.params.id;

  const user = req.locals.user;

  const canReadWorkspace = await securityHelper.canReadWorkspace(idWorkspace, user.id);
  if (!canReadWorkspace) return errorHelper.notFound(res);

  const template = await db.boardTemplate.findOne({where: {id: id, idWorkspace: idWorkspace}});
  if (!template) return res.notFound(res);

  await template.destroy();

  return res.send({});

}));

module.exports = router;
