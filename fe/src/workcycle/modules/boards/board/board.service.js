/**
 * @namespace board.service
 */

// services
import api from './../../api/api.ws.service';
import apiEndpointsService from './../../api/api.endpoints';

// constants
import {API} from './../../api/api.urls';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf board.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[board.service]';

/**
 * board service
 *
 * @memberOf board.service
 * @name boardService
 * @const {Object}
 */
const boardService = {};

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
boardService.getBoard = (workspace, boardId) => {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.BOARD, {
    workspaceId: workspace,
    boardId,
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
 * @param {String} boardId - board ID
 * @return {Promise} Promise wrapper over Api call
 */
boardService.getNestsAndWorkItems = (boardId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.LIST, {
    boardId,
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

boardService.getNests = (workspaceId, boardId) => {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.GET_NESTS, {
    workspaceId,
    boardId,
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

boardService.getBoardMembers = function (workspaceId, boardId) {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.GET_MEMBERS, {
    workspaceId,
    boardId,
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

boardService.updateBoardMembers = function (workspaceId, boardId, boardData) {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.SAVE_MEMBERS, {
    workspaceId,
    boardId,
  });

  const options = {
    body: boardData,
  };

  return new Promise((resolve, reject) => {
    api.put(path, options)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

export default boardService;
