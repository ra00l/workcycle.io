'use strict';

const winston = require('winston');
const config = require('../config').getCurrent();

const Sentry = require('@sentry/node')


module.exports = {
  debug: function(...args) {
    console.debug.apply(this, args);
  },
  log: function(...args) {
    console.log.apply(this, args);
  },
  info: function(...args) {
    console.info.apply(this, args);
  },
  warn: function(...args) {
    console.warn.apply(this, args);
  },
  error: function(...args) {
    console.error.apply(this, args);
    if(args && args.length > 0) {
      const errMsg = args.map(a => JSON.stringify(a)).join(' => ');
      Sentry.captureException(new Error(errMsg));
    }
  }
};
