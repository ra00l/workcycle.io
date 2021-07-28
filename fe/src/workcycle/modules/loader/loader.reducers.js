/**
 * Loader reducers
 *
 * @namespace loader.reducers
 */

// services

// constants
import {
  HIDE,
  SHOW,
} from './loader.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf loader.reducers
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[loader.reducer]';

/**
 * Loader reducer initial state
 *
 * @private
 * @memberOf loader.reducers
 * @const {String}
 * @default
 */
const INITIAL_STATE = {
  show: false,
};

/**
 * Loader reducer
 *
 * @memberOf loader.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function loading(state = INITIAL_STATE, action) {
  const {
    payload,
    type,
  } = action;

  switch (type) {
    case HIDE:
    case SHOW:
      return Object.assign({}, state, {
        show: payload.show,
      });
    default:
      return state;
  }
}

export default loading;
