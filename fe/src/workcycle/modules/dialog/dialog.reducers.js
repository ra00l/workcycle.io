/**
 * @namespace dialog.reducers
 */

import {
  DIALOG_DISMISS,
  DIALOG_SHOW,
  DIALOG_UPDATE,
} from './dialog.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf dialog.reducers
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[dialog.reducers]';

/**
 * Initial state for dialog stored in store
 *
 * @private
 * @memberOf dialog.reducers
 * @const {Object}
 * @default
 */
const INITIAL_STATE = {
  buttons: [],
  closeCb: false,
  content: false,
  isModal: false,
  isConfirmation: false,
  isShown: false,
  title: '',
};

/**
 * Dialog reducer
 *
 * @memberOf dialog.reducers
 *
 * @param {Object} state - Current Redux state
 * @param {Object} action - Current Redux action
 * @return {Object} updated dialog state
 */
function dialog(state = INITIAL_STATE, action) {
  let newState;
  switch (action.type) {
    case DIALOG_DISMISS:
      return INITIAL_STATE;
    case DIALOG_SHOW:
      // always merge based on default state
      return Object.assign({}, INITIAL_STATE, action.data);
    case DIALOG_UPDATE:
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}

export default dialog;
