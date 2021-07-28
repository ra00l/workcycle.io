/**
 * @namespace board
 */

/**
 * @namespace goal.actions
 */

import {
  INVALIDATE_GOAL,
  REQUEST_GOAL,
  RECEIVED_GOAL,
  RECEIVED_GOAL_ERROR,
} from './goal.constants';

// services
import goalService from './goal.service';

// actions
import {setNests} from '../nests/nests.actions';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf board.actions
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[goal.actions]';

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
 * @return {Object} Redux action
 */
privateService.receive = (data) => ({
  payload: {
    board: data,
    boardId: data.id,
  },
  type: RECEIVED_GOAL,
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
  type: RECEIVED_GOAL_ERROR,
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
  type: REQUEST_GOAL,
});

/**
 * Make request to get board
 *
 * @private
 * @memberOf board.actions
 *
 * @param {String} boardId - the board id
 * @return {Function}
 */
privateService.getBoard = (boardId) => (dispatch, getState) => {
  const workspace = getState().company.lastWorkspace;
  dispatch(privateService.request());

  goalService.getBoard(workspace, boardId)
    .then(response => {
      dispatch(privateService.receive(response));
    }, err => {
      dispatch(privateService.receiveError(err));
    });
};

/**
 * Make request to get board nests and work items
 *
 * @private
 * @memberOf board.actions
 *
 * @param {String} boardId - the board id
 * @return {Function}
 */
privateService.getNestsAndWorkItems = (boardId) => (dispatch, getState) => {
  const workspaceId = getState().company.lastWorkspace;

  goalService.getNestsAndWorkItems(workspaceId, boardId)
    .then(response => {
      const {
        fields,
        nests,
      } = response;

      dispatch(setNests(boardId, nests));
      // dispatch(privateService.receive(response));
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
 * @param {String} boardId - the board id
 * @param {Object} state - current state from store
 * @return {Boolean}
 */
privateService.shouldGet = (boardId, state) => {
  const boardStore = state.board;

  if (boardStore.actionInProgress || boardStore.boardId === boardId) {
    return false;
  }

  return true;
};

/**
 * Determine if we need to make request to get nests and work items
 *
 * @private
 * @memberOf board.actions
 *
 * @param {String} boardId - the board id
 * @param {Object} state - current state from store
 * @return {Boolean}
 */
privateService.shouldGetNestsAndWorkItems = (boardId, state) => {
  const nestsStore = state.nests;

  if (nestsStore.boardId === boardId) {
    return false;
  }

  return true;
};

// End private area
// -----------------

/**
 * Get board
 *
 * @memberOf board.actions
 * @function getBoard
 *
 * @param {String} goalId - the board id
 * @return {Function}
 */
const getGoal = (goalId) => (dispatch, getState) => {
  if (privateService.shouldGet(goalId, getState())) {
    return dispatch(privateService.getGoal(goalId));
  }
};

/**
 * Set board
 *
 * @memberOf board.actions
 * @function setBoard
 *
 * @param {Object} goal - board
 * @return {Function}
 */
const setGoal = (goal) => (dispatch, getState) => dispatch(privateService.receive(goal));

/**
 * Invalidate board
 *
 * @memberOf board.actions
 * @function invalidateGoal
 *
 * @return {Function}
 */
const invalidateGoal = () => (dispatch, getState) => dispatch({type: INVALIDATE_GOAL});

/**
 * Get nests and work items for a board
 *
 * @memberOf board.actions
 * @function invalidateBoard
 *
 * @param {String} boardId - board id
 * @return {Function}
 */
const getBoardNestsAndWorkItems = (boardId) => (dispatch, getState) => {
  if (privateService.shouldGetNestsAndWorkItems(boardId, getState())) {
    return dispatch(privateService.getNestsAndWorkItems(boardId));
  }
};

export {
  getGoal,
  invalidateGoal,
  setGoal,
  getBoardNestsAndWorkItems,
};
