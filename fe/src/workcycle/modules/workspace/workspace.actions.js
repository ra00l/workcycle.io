/**
 * @namespace board
 */

/**
 * @namespace workspace.actions
 */

import keyBy from 'lodash.keyby';
import orderBy from 'lodash.orderby';

import {
  INVALIDATE_WORKSPACE,
  REQUEST_WORKSPACE,
  RECEIVED_WORKSPACE,
  RECEIVED_WORKSPACE_ERROR,
  GET_WORKSPACEMEMBERS_REQUEST,
  GET_WORKSPACEMEMBERS_RECEIVE_SUCCESS,
  GET_WORKSPACEMEMBERS_RECEIVE_ERROR,
  ADD_WORKSPACE,
} from './workspace.constants';

// services
import workspaceService from './workspace.service';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf board.actions
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[workspace.actions]';

/**
 * Private service
 *
 * @private
 * @memberOf board.actions
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
 * @memberOf board.actions
 *
 * @param {Object} data - board
 * @param {Object} workspaceId - action
 * @return {Object} none
 */
privateService.receive = (data, workspaceId) => ({
  payload: {
    board: data,
    workspaceId,
  },
  type: RECEIVED_WORKSPACE,
});

/**
 * Error callback when retrieving entity
 *
 * @private
 * @memberOf board.actions
 *
 * @param {Object} errorData - Error object
 * @return {Object} Redux action
 */
privateService.receiveError = (errorData) => ({
  payload: {
    error: errorData,
  },
  type: RECEIVED_WORKSPACE_ERROR,
});

/**
 * Request entity action
 *
 * @private
 * @memberOf board.actions
 *
 * @param {String} actionType - action the is requested
 * @return {Object} Redux action
 */
privateService.request = (actionType) => ({
  type: REQUEST_WORKSPACE,
});

/**
 * Make request to get board
 *
 * @private
 * @memberOf board.actions
 *
 * @param {String} workspaceId - the board id
 * @return {Function}
 */
privateService.getWorkspace = (workspaceId) => (dispatch, getState) => {
  dispatch(privateService.request());

  workspaceService.getBoard(workspaceId)
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
 * @memberOf board.actions
 *
 * @param {String} workspaceId - the board id
 * @param {Object} state - current state from store
 * @return {Boolean}
 */
privateService.shouldGet = (workspaceId, state) => {
  const workspaceStore = state.workspace;

  if (workspaceStore.actionInProgress || workspaceStore.workspaceId === workspaceId) {
    return false;
  }

  return true;
};

/**
 * Get board
 *
 * @memberOf board.actions
 * @function getBoard
 *
 * @param {String} workspaceId - the workspace id
 * @return {Function}
 */
const getWorkspace = (workspaceId) => (dispatch, getState) => {
  if (privateService.shouldGet(workspaceId, getState())) {
    return dispatch(privateService.getWorkspace(workspaceId));
  }
};


/**
 * getWorkspaceMembers
 *
 * @memberOf board.actions
 * @function getBoard
 *
 * @param {String} workspaceId - the board id
 * @return {Function}
 */
const getWorkspaceMembers = (workspaceId) => (dispatch, getState) => {
  dispatch({
    type: GET_WORKSPACEMEMBERS_REQUEST,
  });

  // // call api
  workspaceService.getWorkspaceMembers(workspaceId)
    .then(response => {
      dispatch({
        type: GET_WORKSPACEMEMBERS_RECEIVE_SUCCESS,
        payload: {
          workspaceId,
          data: response,
        },
      });
    }, err => {
      dispatch({
        type: GET_WORKSPACEMEMBERS_RECEIVE_ERROR,
        meta: {
          notification: {
            message: 'WORKSPACE.WORKITEM.MESSAGES.REORDER_ITEM_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

/**
 * Set board
 *
 * @memberOf board.actions
 * @function setBoard
 *
 * @param {Object} workspace - board
 * @return {Function}
 */
const setWorkspace = (workspace) => (dispatch, getState) => dispatch(privateService.receive(workspace));

/**
 * Invalidate board
 *
 * @memberOf board.actions
 * @function invalidateBoard
 *
 * @return {Function}
 */
const invalidateWorkspace = () => (dispatch, getState) => dispatch({type: INVALIDATE_WORKSPACE});

const addWorkspace = (board) => (dispatch, getState) => {
  const payload = {
    data: board,
  };

  return dispatch({
    type: ADD_WORKSPACE,
    payload,
  });
};

export {
  invalidateWorkspace,
  setWorkspace,
  addWorkspace,
  getWorkspaceMembers,
};
