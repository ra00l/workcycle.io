/**
 * @namespace company.reducers
 */

// constants
import {
  COMPANY_SET_DATA,
  COMPANY_INVALIDATE,
  COMPANY_SET_LAST_WORKSPACE_VIEWED,
} from './company.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf company.reducers
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[company.reducers]';

/**
 * Reducer INITIAL_STATE
 *
 * @private
 * @memberOf company.reducers
 * @const {Object}
 * @default
 */
const INITIAL_STATE = {
  data: null,
  lastWorkspace: null,
};

/**
 * Reducer for company
 * @memberOf company.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function company(state = INITIAL_STATE, action) {
  switch (action.type) {
    case COMPANY_SET_DATA:
      return Object.assign({}, state, {
        data: action.payload.data,
        lastWorkspace: state.lastWorkspace,
      });
    case COMPANY_SET_LAST_WORKSPACE_VIEWED:
      return Object.assign({}, state, {
        data: state.data,
        lastWorkspace: action.payload.data,
      });
    case COMPANY_INVALIDATE:
      return INITIAL_STATE;
    default:
      return state;
  }
}

export default company;
