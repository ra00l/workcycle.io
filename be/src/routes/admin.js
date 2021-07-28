'use strict';

const router = require('express').Router();

const gravatar = require('gravatar');

const db = require('../db/models');
const sequelize = require('../db');

const slugify = require('slugify');
const utilities = require('../utilities');

const logger = require('../logger');
const emailTransport = require('../email');
const errorHelper = require('../error-helper');

router.post('/reorder/:idWk', utilities.promiseCatch(async function (req, res) {
  const idWk = req.params.idWk;

  //todo: only allow admins to rename!

  let boards = await db.board.findAll({ where: { idWorkspace: idWk, status: 0 }, attributes: ['id'] });

  //console.log('boards', boards.map(b => b.toJSON()));

  for(let b of boards) {
    //console.log('get nests for board', b.id);

    let nests = await db.nest.findAll({ where: { idBoard: b.id, status: 0 }, attributes: ['id'] });

    //console.log('nests', nests);

    for(let n of nests) {
      let wiList = await db.workItem.findAll({ where: { idNest: n.id, status: 0 }, attributes: ['id', 'order', 'idNest'], orderBy: ['order'] });

      let idx = 1;
      for(let wi of wiList) {
        //wi.order = idx++;
        //await wi.save();
        console.log(wi.toJSON());
      }
    }
  }

  res.send({OK: true});


}));

module.exports = router;
