'use strict';

const config = require('./config').getCurrent();
const logger = require('./src/logger');
const eventService = require('./src/event-service');
const Timer = require('./src/timer');
const Sentry = require('@sentry/node');


const express = require('express');
const app = express();


const env = process.env.NODE_ENV || 'DEVELOPMENT';
const isProd = env === 'PRODUCTION';

if(isProd) {
  console.log('sentry dsn: ', config.sentryDsn);
  Sentry.init({ dsn: config.sentryDsn});

  app.use(Sentry.Handlers.requestHandler());

  logger.info('Sentry error logging intialized!');
  eventService.sendEvent('app initialized');
}

const routes = require('./src/routes');
app.use(express.static('public'));

const server = require('http').Server(app);

const seq = require('./src/db');
const db = require('./src/db/models');
const migrator = require('./src/db/migrations');

const email = require('./src/email');
const utilities = require('./src/utilities');

const webSocket = require('./src/web-socket');

const bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

function setCORSHeaders (res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
}

app.use(function (req, res, next) {
  setCORSHeaders(res);
  console.log('request!!!');
  if (req.method.toLowerCase() === 'options') {
    console.log('options, OK');
    return res.status(200).end();
  }

  next();
});


app.use(routes.initializeRequest);

routes.register(app);
if(isProd) app.use(Sentry.Handlers.errorHandler());

seq
  .authenticate()
//  .then(() => logger.info('Validating email'))
//  .then(email.verify) //  - comment this temporary
//  .then(() => logger.info('Validated email'))
  //.then(() => logger.info("Sync'ing db"))
  .then(db.syncAll.bind(db))
  //.then(() => logger.info("Sync'ed db"))
  .then(() => {
    logger.debug('Connection has been established successfully.');

    migrator().then(() => {
      const port = process.env.PORT || 3456;

      app.disable('x-powered-by');
      server.listen(port, function() {
        logger.info(`App listening on port ${port}! ENV: ${env}`);
      });

      webSocket.init(server);

    });
  })
  .catch(err => {
    logger.error('Unable to start app', err);
  });

