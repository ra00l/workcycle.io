/**
 * @namespace settings
 */

/**
 * @namespace settings.actions
 */

import keyBy from 'lodash.keyby';
import orderBy from 'lodash.orderby';

import {
  ADD_WORKSPACE,
  REMOVE_WORKSPACE,
  REQUEST_WORKSPACES,
  RECEIVED_WORKSPACES,
  RECEIVED_WORKSPACES_ERROR,
} from './settings.constants';

// services
import settingsService from './settings.service';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf boards.actions
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[settings.actions]';

/**
 * Private service
 *
 * @private
 * @memberOf settings.actions
 * @const {Object}
 * @default
 */
const privateService = {};

// Private area
// -------------

/**
 * Success callback when retrieving entity
 *
 * @private
 * @memberOf settings.actions
 *
 * @param {Object} data - list of boards
 * @return {Object} Redux action
 */
privateService.receive = (data) => {
  const sortedBoards = [];
  const boards = keyBy(data, 'id');

  const orderByBoard = orderBy(data, 'order', 'asc');

  orderByBoard.map(board => {
    sortedBoards.push(board.id);
  });

  return {
    payload: {
      data: boards,
      sorted: sortedBoards,
    },
    type: RECEIVED_WORKSPACES,
  };
};

/**
 * Error callback when retrieving entity
 *
 * @private
 * @memberOf settings.actions
 *
 * @param {Object} errorData - Error object
 * @return {Object} Redux action
 */
privateService.receiveError = (errorData) => ({
  payload: {
    error: errorData,
  },
  type: RECEIVED_WORKSPACES_ERROR,
});

/**
 * Make request to get settings
 *
 * @private
 * @memberOf settings.actions
 *
 * @param {String} workspaceId - workspace id
 * @return {Function}
 */
privateService.getWorkspaces = () => (dispatch, getState) => {
  // request settings
  dispatch({
    type: REQUEST_WORKSPACES,
  });

  // call api
  settingsService.getWorkspaces()
    .then(response => {
      dispatch(privateService.receive(response));
    }, err => {
      dispatch(privateService.receiveError(err));
    });
};

/**
 * Determine if we need to make request
 *
 * @private
 * @memberOf boards.actions
 *
 * @param {Object} state - current state from store
 * @param {String} entity - entity the we are trying to fetch
 * @return {Boolean}
 */
privateService.shouldGet = (state) => {
  const entityFromStore = state.boards;

  // there is an action in progress or we have data in the store
  if (entityFromStore.actionInProgress || entityFromStore.data) {
    return false;
  }

  return true;
};

// End private area
// -----------------

/**
 * Get boards
 *
 * @memberOf boards.actions
 * @function getWorkspaces
 *
 * @param {String} workspaceId - workspace id
 * @return {Function}
 */
const getWorkspaces = (workspaceId) => (dispatch, getState) => {
  if (privateService.shouldGet(getState())) {
    return dispatch(privateService.getWorkspaces());
  }
};

/**
 * Add board
 *
 * @memberOf boards.actions
 * @function addBoard
 *
 * @param {Object} board - the board the added in the store
 * @return {Function}
 */
const addWorkspace = (board) => (dispatch, getState) => {
  const payload = {
    data: board,
  };

  return dispatch({
    type: ADD_WORKSPACE,
    payload,
  });
};

const removeWorkspace = (workspaceId) => (dispatch, getState) =>
  dispatch({
    type: REMOVE_WORKSPACE,
    payload: {
      workspaceId,
    },
  });

export {
  getWorkspaces,
  addWorkspace,
  removeWorkspace,
};
