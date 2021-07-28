/**
 * @namespace signIn.service
 */

// services
import api from '../api/api.ws.service';

// constants
import {API} from '../api/api.urls';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf signIn.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[signIn.service]';

/**
 * signIn service
 *
 * @memberOf signIn.service
 * @name signInService
 * @const {Object}
 */
const signInService = {};

/**
 * Login call
 *
 * @memberOf signIn.service
 * @method doLoginWith
 *
 * @param {String} email - email used to login
 * @param {String} password - password used to login
 * @return {Promise} Promise wrapper over Api call
 */
signInService.doLoginWith = (email, password) => {

  const path = API.LOGIN;
  const options = {
    body: {
      email,
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

export default signInService;
