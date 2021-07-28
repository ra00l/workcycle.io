'use strict';

const utilities = require('../utilities');
const db = require('../db/models');

const routePrefix = '/api/';

const indexRouter = require('express').Router({mergeParams: true});

indexRouter.get('/', function (req, res) {
  res.send('hello');
});

const routesList = [
  {url: routePrefix, router: indexRouter },
  {url: routePrefix + 'maintenance', router: require('./maintenance')},
  {url: routePrefix + 'account', router: require('./account')},
  {url: routePrefix + 'workspace', router: require('./workspace')},
  {url: routePrefix + 'workspace/:idWorkspace/board', router: require('./board')},
  {url: routePrefix + 'workspace/:idWorkspace/goal', router: require('./board')},
  {url: routePrefix + 'workspace/:idWorkspace/template', router: require('./template')},
  {url: routePrefix + 'board/:idBoard/work-item', router: require('./work-item')},
  {url: routePrefix + 'board/:idBoard/nest', router: require('./nest')},
  {url: routePrefix + 'board/:idBoard/import', router: require('./import')},
  {url: routePrefix + 'admin', router: require('./admin')},
  {url: routePrefix + 'file', router: require('./file')}
];

module.exports = {
  register: function (app) {
    routesList.forEach(function (route) {
      app.use(route.url, route.router);
    });
  },
  initializeRequest: utilities.promiseCatch(async function(req, res, next) {

    req.locals = req.locals || {};

    let auth = req.headers['authorization'];
    if (auth) {
      let token = req.headers['authorization'].replace('Bearer ', '');
      req.locals.token = token;
      //console.log('found token: ', token);

      let decrypted = utilities.decryptToken(token);
      //console.log('decrypted:', decrypted);
      if(decrypted) {
        req.locals.user = await db.user.findById(decrypted);
      }
      //console.log('user: ', req.locals.user);
    }

    next();
    //should also check jwt token here... https://github.com/auth0/node-jsonwebtoken
    //if(req.toke) {
    //populateFromToken();
  })
};

