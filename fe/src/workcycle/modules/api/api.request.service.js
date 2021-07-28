
/**
 * @namespace api.request
 */

// services
import browserUtilService from '../../services/browser.util.service';

// constants
import {
  LAST_WORKSPACE_VIEWED,
  SESSION_TOKEN,
  NOT_LOGGED_ID,
} from '../auth/auth.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf api.request
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[api.request.service]';

/**
 * Api requests service
 *
 * @static
 * @memberOf api.request
 * @name apiRequest
 * @type {Object}
 */
const service = {};

/**
 * Handle request, will make API request using fetch that will be wrapped in a Promise
 *
 * @static
 * @memberOf api.request
 * @method handleRequest
 *
 * @param {String} url - url
 * @param {Object} options - request options
 * @return {Promise} requestPromise - promise wrapper over fetch
 */
service.handleRequest = (url, options) =>
  new Promise((resolve, reject) => fetch(url, options)
    .then((response) => {
      const {status} = response;
      if (status >= 200 && status < 300) {
        response.json()
          .then(jsonResponse => {
            resolve(jsonResponse);
          })
          .catch(error => {
            reject(error);
          });
      } else if (status === 401) {
        localStorage.removeItem(SESSION_TOKEN);
        localStorage.removeItem(LAST_WORKSPACE_VIEWED);
        reject();
        if (localStorage.getItem(NOT_LOGGED_ID) !== '1') {
          localStorage.setItem(NOT_LOGGED_ID, '1');
          browserUtilService.goToLocation('/');
        }
      } else if (status === 412) {
        reject({
          status: 412,
        });
      } else {
        response.json()
          .then(jsonResponse => {
            reject(jsonResponse);
          })
          .catch(error => {
            reject(error);
          });

      }
    })
    .catch((error) => {
      reject(error);
    })
  );

export default service;
