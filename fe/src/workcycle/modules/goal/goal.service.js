/**
 * @namespace goal.service
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
const LOG_PREFIX = '[goal.service]';

/**
 * board service
 *
 * @memberOf board.service
 * @name boardService
 * @const {Object}
 */
const goalService = {};

/**
 * get board
 *
 * @memberOf board.service
 * @method getBoard
 *
 * @param {String} workspace - workspace id
 * @param {String} goalId - board id
 * @return {Promise} Promise wrapper over Api call
 */
goalService.getGoal = (workspace, goalId) => {
  const path = apiEndpointsService.normalizeUrl(API.GOALS.GOAL, {
    workspaceId: workspace,
    goalId,
  });

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
 * get nest and work items for a specific board
 *
 * @memberOf workItems.service
 * @method getNestsAndWorkItems
 *
 * @param {String} workspaceId - workspace ID
 * @param {String} goalId - board ID
 * @return {Promise} Promise wrapper over Api call
 */
goalService.getNestsAndWorkItems = (workspaceId, goalId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.LIST, {
    // FIXME: workspaceId, add workspace ?
    goalId,
  });

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

export default goalService;
