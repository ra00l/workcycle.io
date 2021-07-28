/**
 * @namespace initApp.reducers
 */

// constants
import {DEPENDENCY_DONE} from './initApp.constants';
import {
  REQUEST_LOCALE,
  RECEIVE_LOCALE,
  RECEIVE_LOCALE_ERROR,
} from './../l10n/l10n.constants';

import {
  USER_INFO_REQUEST_SUCCESS,
  USER_INFO_REQUEST_ERROR,
} from '../auth/auth.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf initApp.reducers
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[initApp.reducers]';

/**
 * Reducer INITIAL_STATE
 *
 * @private
 * @memberOf initApp.reducers
 * @const {Object}
 * @default
 */
const INITIAL_STATE = {
  done: false,
  l10n: false,
  userInfo: false,
  success: null,
};

/**
 * Reducer for initApp. Listens to all actions and prepares reduced objects for state.
 * @memberOf initApp.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function initApp(state = INITIAL_STATE, action) {
  switch (action.type) {
    case DEPENDENCY_DONE:
      return Object.assign({}, state, {
        done: true,
        success: true,
      });
    case REQUEST_LOCALE:
      return Object.assign({}, state, {
        done: false,
        l10n: false,
      });
    case RECEIVE_LOCALE:
      return Object.assign({}, state, {
        l10n: true,
      });
    case RECEIVE_LOCALE_ERROR:
      return Object.assign({}, state, {
        done: true,
        l10n: false,
        success: false,
      });
    case USER_INFO_REQUEST_SUCCESS:
      return Object.assign({}, state, {
        userInfo: true,
      });
    case USER_INFO_REQUEST_ERROR:
      return Object.assign({}, state, {
        userInfo: true,
      });
    default:
      return state;
  }
}

export default initApp;
