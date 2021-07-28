/**
 * @namespace auth.service
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
 * @memberOf board.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[auth.service]';

/**
 * board service
 *
 * @memberOf board.service
 * @name boardService
 * @const {Object}
 */
const authService = {};

/**
 * get board
 *
 * @memberOf board.service
 * @method getBoard
 *
 * @param {String} workspace - workspace id
 * @param {String} boardId - board id
 * @return {Promise} Promise wrapper over Api call
 */
authService.getUserInfo = (workspaceId) => {
  const path = apiEndpointsService.normalizeUrl(API.AUTH.USER_INFO, {
    workspaceId: workspaceId || '',
  });

  return new Promise((resolve, reject) => {
    api.post(path)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

authService.loginAs = (email) => {
  const path = apiEndpointsService.normalizeUrl(API.AUTH.LOGIN_AS, {
  });

  const options = {
    body: {email: email},
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

export default authService;
