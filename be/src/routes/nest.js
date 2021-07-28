'use strict';
const router = require('express').Router({mergeParams: true});

const db = require('../db/models');
const utilities = require('../utilities');

const logger = require('../logger');
const errorHelper = require('../error-helper');

const securityHelper = require('../security-helper');

const orderHelper = require('../order-helper');

const webSocket = require('../web-socket');

const ObjectStatus = require('../common/status-enum');

router.all('*', function (req, res, next) {
  if (!req.locals.user) return errorHelper.unauth(res);

  //need board for all operations
  if (!req.params.idBoard) return errorHelper.notFound(res);

  next();
});

router.post('/', async function (req, res) {
  let user = req.locals.user;
  let idBoard = +req.params.idBoard;
  let name = req.body.name;
  let color = req.body.color;

  if (!name) return errorHelper.respondWithCode('NAME_REQUIRED', res);

  let nextOrder = ((await db.nest.max('order', {
    where: {
      idBoard: idBoard
    }
  })) || 0) + 1;

  let newNest = await db.nest.create({
    name: req.body.name,
    idBoard: idBoard,
    color: color,
    order: nextOrder,
    createdBy: user.id,
    status: 0
  });

  webSocket.pushEvent('nestCreated', { idBoard: newNest.idBoard, id: newNest.id, title: newNest.name, order: nextOrder });

  return res.send({id: newNest.id, order: nextOrder});
});

router.put('/:id', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;
  let idBoard = +req.params.idBoard;
  let id = +req.params.id;
  let name = req.body.name;
  let color = req.body.color;
  let newOrder = +req.body.order;
  let idNewBoard = +req.body.idBoard;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  let existingBoard = await db.board.findOne({where: {id: idBoard}});
  if (!existingBoard) return errorHelper.notFound(res);

  let existingNest = await db.nest.findOne({where: {id: id, idBoard: idBoard}});
  if (!existingNest) return errorHelper.notFound(res);

  if (name) existingNest.name = name;
  if (color) existingNest.color = color;
  let tx = null;

  try {

    if (idNewBoard) {

      if(existingBoard.idDefaultNest === existingNest.id)
        return errorHelper.respondWithCode('CANNOT_MOVE_DEFAULT_NEST', res);

      tx = await db.raw.transaction();

      existingNest.idBoard = idNewBoard;

      await db.raw.query('update "workItem" set "idBoard"=:idNewBoard where "idNest"=:idNest', {
        replacements: {idNewBoard: existingNest.idBoard, idNest: existingNest.id},
        type: db.raw.QueryTypes.UPDATE,
        transaction: tx
      });

      tx.commit();
    }

    if (newOrder) {
      let oldOrder = existingNest.order;

      await orderHelper.changeOrder(oldOrder, newOrder, 'nest', '"idBoard"=:idBoard', {idBoard: idBoard});

      existingNest.order = newOrder;
    }
  }
  catch(ex) {
    console.log('error: ', ex);
    tx && tx.rollback();
  }

  await existingNest.save();

  res.send({});

}));

router.post('/clone/:id', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;
  let idBoard = +req.params.idBoard;
  let id = +req.params.id;
  let newNestName = req.body.nestName;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  let existingNest = await db.nest.findOne({where: {id: id, idBoard: idBoard}});
  if (!existingNest) return errorHelper.notFound(res);

  let tx = null;
  try {
    tx = await db.raw.transaction();

    let newNest = await db.nest.create({ name: newNestName || existingNest.name + ' copy', idBoard: existingNest.idBoard, color: existingNest.color, order: existingNest.order, status: 0, createdBy: user.id }, { tx });

    let wiList = await db.workItem.findAll({where: { idNest: existingNest.id, status: ObjectStatus.Active }, order: [['idParent', 'desc']]});
    wiList = wiList.sort((a, b) => a.idParent > b.idParent);
    let newWiList = [];
    let wiMap = {};
    for(let wi of wiList) {
      let newWi = await db.workItem.create({title: wi.title, description: wi.description, order: wi.order, status: 0, idClient: wi.idClient, idBoard: wi.idBoard, idParent: wiMap[wi.idParent] || null, data: wi.data, idNest: newNest.id, createdBy: user.id}, { tx });
      newWiList.push(newWi);
      wiMap[wi.id] = newWi.id;
    }

    tx.commit();

    let out = { id: newNest.id, name: newNest.name, workItems: newWiList };

    return res.send(out);
  }
  catch(err) {
    logger.error('error cloning nest: ', err);
    tx.rollback();

    return errorHelper.respondWithCode('CANNOT_DELETE', res);
  }

}));

router.delete('/:id', utilities.promiseCatch(async function(req, res) {
  let user = req.locals.user;
  let idBoard = +req.params.idBoard;
  let id = +req.params.id;

  if (!securityHelper.canModifyBoard(idBoard, user.id)) return errorHelper.readonly(res);

  let existingNest = await db.nest.findOne({where: {id: id, idBoard: idBoard}});
  if (!existingNest) return errorHelper.notFound(res);

  let tx = null;
  try{
    tx = await db.raw.transaction();

    existingNest.status = ObjectStatus.Deleted;
    await existingNest.save({ tx });

    await db.workItem.update({ status: 1 }, { where: { idNest: existingNest.id } , transaction: tx });

    tx.commit();

    webSocket.pushEvent('nestDeleted', { idBoard: existingNest.idBoard, id: existingNest.id, title: existingNest.name });

    return res.send({});
  }
  catch(err) {
    logger.error('error deleteing nest: ', err);
    tx.rollback();

    return errorHelper.respondWithCode('CANNOT_DELETE', res);
  }
}));

router.get('/list', utilities.promiseCatch(async function (req, res) {
  //let user = req.locals.user;
  let idBoard = +req.params.idBoard;

  let nestList = await db.nest.findAll({attributes: ['id', 'name', 'color', 'order'], where: {idBoard: idBoard, status: 0}});

  return res.send(nestList);
}));

module.exports = router;
