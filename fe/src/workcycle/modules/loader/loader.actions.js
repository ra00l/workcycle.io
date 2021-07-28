/**
 * Loader module
 *
 * @namespace loader
 */

/**
 * Loader Actions
 *
 * @namespace loader.actions
 */

// services
//
// constants
import {
  HIDE,
  SHOW,
} from './loader.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf loader.actions
 *
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[loader.actions]';

/**
 * Hide loader
 *
 * @function hideLoader
 * @memberOf loader.actions
 *
 * @return {Function}
 */
const hideLoader = () => (dispatch, getState) => {

  const oldShow = getState().loader.show;

  if (oldShow !== false) {
    // trigger action only if we have show

    dispatch({
      payload: {
        show: false,
      },
      type: HIDE,
    });
  }
};

/**
 * Show loader with message
 *
 * @function showLoader
 * @memberOf loader.actions
 *
 * @return {Function}
 */
const showLoader = () => (dispatch, getState) => {

  const oldShow = getState().loader.show;

  if (oldShow !== true) {
    // trigger action only if we have show

    dispatch({
      payload: {
        show: true,
      },
      type: SHOW,
    });
  }
};

export {
  hideLoader,
  showLoader,
};
