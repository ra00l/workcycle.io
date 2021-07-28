/**
 * @namespace changePassword.service
 */

// services
import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf changePassword.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[changePassword.service]';

/**
 * changePassword service
 *
 * @memberOf changePassword.service
 * @name changePasswordService
 * @const {Object}
 */
const changePasswordService = {};

/**
 * Change password call
 *
 * @memberOf changePassword.service
 * @method setNewPassword
 *
 * @param {String} password - password used to login
 * @param {String} resetPasswordToken - the temporay token to validate the request
 * @return {Promise} Promise wrapper over Api call
 */
changePasswordService.setNewPassword = (password, resetPasswordToken) => {

  const path = apiEndpointsService.normalizeUrl(API.CHANGE_PASSWORD, {
    token: resetPasswordToken,
  });

  const options = {
    body: {
      password,
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

export default changePasswordService;
