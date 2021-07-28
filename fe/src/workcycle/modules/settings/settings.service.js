/**
 * @namespace settings.service
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
 * @memberOf settings.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[settings.service]';

/**
 * boards private service
 *
 * @memberOf settings.service
 * @name boardsPrivateService
 * @const {Object}
 */
const privateService = {};

/**
 * boards service
 *
 * @memberOf boards.service
 * @name boardsService
 * @const {Object}
 */
const settingsService = {};

/**
 * get boards
 *
 * @memberOf boards.service
 * @method getBoards
 *
 * @return {Promise} Promise wrapper over Api call
 */
settingsService.getWorkspaces = () => {
  const path = apiEndpointsService.normalizeUrl(API.SETTINGS.WORKSPACE_LIST);

  return new Promise((resolve, reject) => {
    api.get(path)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

/**
 * Create new board
 *
 * @memberOf boards.service
 * @method createBoard
 *
 * @param {String} workspaceId - cirrent workspace id
 * @param {Object} board - board that will be created
 * @return {Promise} Promise wrapper over Api call
 */
settingsService.createWorkspace = (workspace) => {
  const path = apiEndpointsService.normalizeUrl(API.WORKSPACES.CREATE);

  const options = {
    body: workspace,
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

/**
 * Create new board
 *
 * @memberOf boards.service
 * @method createBoard
 *
 * @param {String} workspaceId - cirrent workspace id
 * @param {Object} board - board that will be created
 * @return {Promise} Promise wrapper over Api call
 */
settingsService.updateAccount = (accountInfo) => {
  const path = apiEndpointsService.normalizeUrl(API.ACCOUNT_SETTINGS);

  const options = {
    body: accountInfo,
    noAutoHeaders: true,
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

settingsService.removeWorkspace = (workspaceId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORKSPACES.DELETE, {
    workspaceId,
  });

  const options = {
    body: {},
  };

  return new Promise((resolve, reject) => {
    api.delete(path, options)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

export default settingsService;
