/**
 * @namespace workspace.reducers
 */

// constants
import {
  REQUEST_WORKSPACE,
  RECEIVED_WORKSPACE,
  RECEIVED_WORKSPACE_ERROR,
  INVALIDATE_WORKSPACE,
} from './workspace.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf board.reducers
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[workspace.reducers]';

/**
 * Reducer INITIAL_STATE
 *
 * @private
 * @memberOf board.reducers
 * @const {Object}
 * @default
 */
const INITIAL_STATE = {
  actionInProgress: false,
  workspaceId: null,
  data: null,
  error: null,
};

/**
 * Reducer for board. Listens to all actions and prepares reduced objects for state.
 * @memberOf board.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function workspace(state = INITIAL_STATE, action) {
  switch (action.type) {
    case REQUEST_WORKSPACE:
      return Object.assign({}, state, {
        actionInProgress: true,
        workspaceId: action.payload.workspaceId,
        data: null,
      });
    case RECEIVED_WORKSPACE:
      return Object.assign({}, state, {
        actionInProgress: false,
        workspaceId: action.payload.workspaceId,
        data: action.payload.workspace,
      });
    case RECEIVED_WORKSPACE_ERROR:
      return Object.assign({}, state, {
        actionInProgress: false,
        workspaceId: null,
        data: null,
        error: action.payload.error,
      });
    case INVALIDATE_WORKSPACE:
      return INITIAL_STATE;
    default:
      return state;
  }
}

export default workspace;
