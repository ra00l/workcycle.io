/**
 * @namespace alert.reducers
 */

import {
  ADD_ALERT,
  REMOVE_ALERT,
} from './alert.constants';

/**
 * Prefix for logging
 *
 * @default
 * @private
 * @const {String}
 * @memberOf alert.reducers
 */
const LOG_PREFIX = '[alert.reducers]';

/**
 * Alerts reducer
 *
 * @method alerts
 * @memberOf alert.reducers
 *
 * @param {Object} state - Current state
 * @param {Object} action - Current Action
 * @return {Object}
 */
const alerts = (state = [], action) => {
  let newState;
  const {
    payload,
    type,
  } = action;

  switch (type) {
    case ADD_ALERT:
      return [].concat(state, payload);
    case REMOVE_ALERT:
      newState = [...state];
      newState.splice(payload.index, 1);
      return newState;
    default:
      return state;
  }
};

export default alerts;
