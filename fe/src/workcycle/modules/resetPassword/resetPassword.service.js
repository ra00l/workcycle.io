/**
 * @namespace resetPassword.service
 */

// services
import api from '../api/api.ws.service';

// constants
import {API} from '../api/api.urls';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf resetPassword.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[resetPassword.service]';

/**
 * resetPassword service
 *
 * @memberOf resetPassword.service
 * @name resetPasswordService
 * @const {Object}
 */
const resetPasswordService = {};

/**
 * Reset password call
 *
 * @memberOf resetPassword.service
 * @method resetPassword
 *
 * @param {String} email - email address of the account we will reset
 * @return {Promise} Promise wrapper over Api call
 */
resetPasswordService.resetPassword = (email) => {

  const path = API.RESET_PASSWORD;
  const options = {
    body: {
      email,
    },
  };

  return new Promise((resolve, reject) => {
    api.post(path, options)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });

  });
};

export default resetPasswordService;
