/**
 * @namespace dialog.actions
 */

// constants
import {
  DIALOG_DISMISS,
  DIALOG_SHOW,
  DIALOG_UPDATE,
} from './dialog.constants';

// services
import l10nService from '../l10n/l10n.service';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf dialog.actions
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[dialog.actions]';

/**
 * Dismiss dialog, action.
 * This action should be called from dialog component or any other component that wants to dismiss dialog.
 *
 * @memberOf dialog.actions
 * @function dismiss
 *
 * @return {Object}
 */
const dismiss = () => {
  // reset body style
  document.body.style.overflow = 'auto';

  return {
    type: DIALOG_DISMISS,
  };
};

/**
 * Show dialog, action.
 * This action should be called from any component that wants to show dialog, but not from dialog component.
 *
 * @memberOf dialog.actions
 * @function show
 *
 * @param {Object} opts - Dialog options
 * @param {Array<Object>} buttons - Dialog buttons
 * @return {Object}
 */
const show = (opts = {}, buttons) => {
  const reducedData = {};

  if (buttons) {
    reducedData.buttons = prepareButtons(buttons);
  }
  // else 'dialog without buttons')

  if (opts.content) {
    reducedData.content = opts.content;
  }
  // else 'dialog without content'

  if (opts.title) {
    reducedData.title = opts.title;
  }
  // else 'dialog without title'

  if (opts.closeCb) {
    reducedData.closeCb = opts.closeCb;
  }
  // 'dialog without the close callback'

  if (opts.className) {
    reducedData.className = opts.className;
  }

  if (!buttons && !opts.content && !opts.title) {
    return {
      type: 'IGNORE',
    };
  }

  reducedData.isConfirmation = opts.isConfirmation ? true : false;
  reducedData.isShown = true;

  return {
    data: reducedData,
    type: DIALOG_SHOW,
  };
};

/**
 * Show confirmation dialog, action.
 * This action should be called from any component that wants to show confirmation dialog, but not from dialog component.
 *
 * @memberOf dialog.actions
 * @function showConfirmation
 *
 * @param {Object} opts - Dialog options
 * @param {Object} button - Dialog main button
 * @return {Function}
 */
const showConfirmation = (opts = {}, button = {}) => (dispatch, getState) => {
  const reducedButtons = [];

  if (button && button.clickCb && button.label) {
    reducedButtons.push({
      clickCb: button.clickCb,
      label: button.label,
      type: 'primary',
    });
  }
  // else 'dialog button is missing primary label and/or clickCb'

  if (button && button.secondaryClickCb && button.secondaryLabel) {
    // custom secondary button
    reducedButtons.push({
      clickCb: button.secondaryClickCb,
      label: button.secondaryLabel,
      type: 'link',
    });
  } else {
    // default secondary button is "Cancel" button
    reducedButtons.push({
      label: l10nService.translate('BUTTONS.CANCEL'),
      type: 'link',
    });
  }
  // extend options with isConfirmation
  opts.isConfirmation = true;

  return dispatch(show(opts, reducedButtons));
};

/**
 * Update dialog, action
 * This action should be called from any component that wants to update dialog, but not from dialog component.
 *
 * @memberOf dialog.actions
 * @function update
 *
 * @param {Object} opts - Dialog options
 * @return {Object}
 */
const update = (opts) => {
  let reducedData = {};

  if (opts.buttons) {
    reducedData.buttons = prepareButtons(opts.buttons);
    // clear what we had on buttons
    opts.buttons = [];
  }

  reducedData = Object.assign({}, opts, reducedData);

  return {
    data: reducedData,
    type: DIALOG_UPDATE,
  };
};

// =====
// Private area
// =====

/**
 * Prepare buttons for dialog
 *
 * @private
 * @memberOf dialog.actions
 * @function prepareButtons
 *
 * @param {Array<Object>} buttons - Buttons properties
 * @return {Array<Object>}
 */
const prepareButtons = (buttons) => {
  const updatedButtons = [];
  const buttonsLength = buttons.length;
  for (let i = 0; i < buttonsLength; i += 1) {
    // Button object needs to have at least label
    if (buttons[i].label) {
      updatedButtons.push(buttons[i]);
    }
  }

  return updatedButtons;
};

// export actions
export {
  dismiss as dismissDialog,
  show as showDialog,
  showConfirmation as showConfirmationDialog,
  update as updateDialog,
};
