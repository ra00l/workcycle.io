'use strict';
const crypto = require('crypto');
const config = require('../config').getCurrent();
const logger = require('./logger');
const errorHelper = require('./error-helper');

const jwt = require('jsonwebtoken');

module.exports = {
  random: function(cnt) {
    return crypto.randomBytes(cnt || 20).toString('hex');
  },
  generateToken: function(data) {
    return jwt.sign({
      data: data
    }, config.secret, { expiresIn: '148h' });
  },
  decryptToken: function(token) {
    try {
      return jwt.verify(token, config.secret).data;
    }
    catch(ex) { //token invalid or expired
      return null;
    }
  },
  promiseCatch: function(fn) {
    return function(...args) {
      const fnArgs = arguments;
      fn(...args).catch(function(err, ...args) {
        logger.error(err);

        if(fnArgs && fnArgs.length > 1) {
          var req = fnArgs[0];
          var res = fnArgs[1];

          logger.error(`request data: url: ${req.originalUrl || req.url}, method: ${req.method}, params: ${JSON.stringify(req.params)}, query: ${JSON.stringify(req.query)}, body: ${JSON.stringify(req.body)}`);

          return errorHelper.serverError(res);
        }

      });
    };
  },
  hash: function(pwd) {
    let hash = crypto.createHmac('sha512', config.salt); /** Hashing algorithm sha512 */
    hash.update(pwd);
    return hash.digest('hex');
  }
};
