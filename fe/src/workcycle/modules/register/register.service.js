/**
 * @namespace register.service
 */

// services
import api from '../api/api.ws.service';

// constants
import {API} from '../api/api.urls';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf register.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[register.service]';

/**
 * register service
 *
 * @memberOf register.service
 * @name registerService
 * @const {Object}
 */
const registerService = {};

/**
 * Registration call
 *
 * @memberOf register.service
 * @method register
 *
 * @param {Object} account - account information
 * @return {Promise} Promise wrapper over Api call
 */
registerService.register = (account) => {

  const path = API.REGISTER;
  const options = {
    body: {
      ...account,
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

export default registerService;
