/**
 * @namespace dashboard.reducers
 */

// constants
import {
  REQUEST_BOARDS,
  RECEIVED_BOARDS,
  RECEIVED_BOARDS_ERROR,
} from '../boards/boards.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf dashboard.reducers
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[dashboard.reducers]';

/**
 * Reducer INITIAL_STATE
 *
 * @private
 * @memberOf dashboard.reducers
 * @const {Object}
 * @default
 */
const INITIAL_STATE = {
  boardsActionInProgress: false,
  // boards: [],
};

/**
 * Reducer for dashboard. Listens to all actions and prepares reduced objects for state.
 * @memberOf dashboard.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function initApp(state = INITIAL_STATE, action) {
  switch (action.type) {
    case REQUEST_BOARDS:
      return Object.assign({}, state, {
        boardsActionInProgress: true,
      });
    case RECEIVED_BOARDS:
      return Object.assign({}, state, {
        boardsActionInProgress: false,
        // boards: action.payload.data,
      });
    case RECEIVED_BOARDS_ERROR:
      return Object.assign({}, state, {
        boardsActionInProgress: false,
        // boards: [],
      });
    default:
      return state;
  }
}

export default initApp;
