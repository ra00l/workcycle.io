/**
 * @namespace initApp
 */

/**
 * @namespace initApp.actions
 */

// constants
import {DEPENDENCY_DONE} from './initApp.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf initApp.actions
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[initApp.actions]';

/**
 * Done retrieving dependencies
 *
 * @memberOf initApp.actions
 * @function getDependencySuccess
 *
 * @return {Function}
 */
const getDependencySuccess = () => (dispatch) => (dispatch({
  success: true,
  meta: {
    notification: {
      silent: true,
    },
  },
  type: DEPENDENCY_DONE,
}));

export {
  getDependencySuccess,
};
