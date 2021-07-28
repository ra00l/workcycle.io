'use strict';

const logger = require('./logger');

const errors = {
  'EMAIL_REQUIRED': 'Email is required',
  'PASSWORD_REQUIRED': 'Password is required',
  'INVALID_CREDENTIALS': 'Email / password do not match',
  'NO_PASS': 'No passsword provided',
  'INVALID_RESET_TOKEN': 'Invalid or expired token!',
  'EMAIL_NOT_VALID': 'No email provided or email not valid',
  'COMPANY_NAME_NOT_VALID': 'No company name provided',
  'WELCOME_EMAIL_FAILED': 'Could not send welcome email',
  'INVITE_EMAIL_FAILED': 'Could not send invite email',
  'NAME_REQUIRED': 'Name is required'
};

function getError(code) {
  let text = errors[code];
  if(!text) {
    logger.warn('no text for error code: ', code);
  }

  return { error: text, code: code };
}

const ERROR_STATUS = 422;
module.exports = {
  getError: function (code) {
    return getError(code);
  },
  respondWithList: function(errArr, res) {
    if(!res) throw new Error('error-helper.js: Response object not defined!');
    return res.status(ERROR_STATUS).send({ errors: errArr });
  },
  customError: function(err, res) {
    if(!res) throw new Error('error-helper.js: Response object not defined!');
    return res.status(ERROR_STATUS).send({ error: err });
  },
  respondWithCode: function(code, res) {
    if(!res) throw new Error('error-helper.js: Response object not defined!');
    return res.status(ERROR_STATUS).send({ errors: [ getError(code) ] });
  },
  notFound: function(res, msg) {
    if(!res) throw new Error('error-helper.js: Response object not defined!');

    logger.warn('404 caused by route!');
    return res.status(404).send(msg);
  },
  unauth: function(res) {
    if(!res) throw new Error('error-helper.js: Response object not defined!');
    return res.status(401).send();
  },
  readonly: function(res) {
    if(!res) throw new Error('error-helper.js: Response object not defined!');
    return res.status(412).send();
  },
  serverError: function(res, msg) {
    if(!res) throw new Error('error-helper.js: Response object not defined!');
    return res.status(500).send(msg);
  }
};
