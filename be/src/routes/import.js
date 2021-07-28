'use strict';
const router = require('express').Router({mergeParams: true});

const db = require('../db/models');
const utilities = require('../utilities');

const TrelloImporter = require('../import/trello');
const GithubImporter = require('../import/github');

const logger = require('../logger');
const errorHelper = require('../error-helper');

const securityHelper = require('../security-helper');

const orderHelper = require('../order-helper');

const webSocket = require('../web-socket');

router.all('*', function (req, res, next) {
  if (!req.locals.user) return errorHelper.unauth(res);

  //need board for all operations
  if (!req.params.idBoard) return errorHelper.notFound(res);

  next();
});

router.get('/trello', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;
  let idBoard = +req.params.idBoard;
  let name = req.body.name;
  let color = req.body.color;

  let trello = new TrelloImporter();

  return res.send(await trello.test());
}));

router.get('/github', utilities.promiseCatch(async function (req, res) {
  let user = req.locals.user;
  let idBoard = +req.params.idBoard;
  let name = req.body.name;
  let color = req.body.color;

  let trello = new GithubImporter();

  return res.send(await trello.test());
}));


module.exports = router;
