/**
 * @namespace alert.actions
 */

// constants
import {
  ADD_ALERT,
  DANGER,
  INFO,
  REMOVE_ALERT,
  SUCCESS,
  WARNING,
} from './alert.constants';

/**
 * Prefix for logging
 *
 * @default
 * @private
 * @const {String}
 * @memberOf alert.actions
 */
const LOG_PREFIX = '[alert.actions]';

/**
 * Private object with methods/properties for actions
 *
 * @private
 * @type {Object}
 * @memberOf alert.actions
 */
const privateApi = {};

/**
 * Unique key for the Alert
 *
 * @private
 * @type {Number}
 * @memberOf alert.actions
 */
privateApi.alertKey = 0;

/**
 * Add alert action creator
 *
 * @private
 * @method addAlert
 * @memberOf alert.actions
 *
 * @param {String} text - The text for the alert
 * @param {String} alertType - The type of the alert
 * @return {Object}
 */
privateApi.addAlert = (text, alertType) => {
  privateApi.alertKey += 1;

  return {
    payload: {
      alertType,
      key: privateApi.alertKey,
      text,
    },
    type: ADD_ALERT,
  };
};

/**
 * Add alert action creator
 *
 * @deprecated Use specific alert action
 *
 * @method addAlert
 * @memberOf alert.actions
 *
 * @param {String} text - The text for the alert
 * @param {String} alertType - The type of the alert
 * @return {Object}
 */
const addAlert = (text, alertType) => privateApi.addAlert(text, alertType);

/**
 * Add danger alert action creator
 *
 * @method addDangerAlert
 * @memberOf alert.actions
 *
 * @param {String} text - The text for the alert
 * @return {Object}
 */
const addDangerAlert = (text) => privateApi.addAlert(text, DANGER);

/**
 * Add info alert action creator
 *
 * @method addInfoAlert
 * @memberOf alert.actions
 *
 * @param {String} text - The text for the alert
 * @return {Object}
 */
const addInfoAlert = (text) => privateApi.addAlert(text, INFO);

/**
 * Add success alert action creator
 *
 * @method addSuccessAlert
 * @memberOf alert.actions
 *
 * @param {String} text - The text for the alert
 * @return {Object}
 */
const addSuccessAlert = (text) => privateApi.addAlert(text, SUCCESS);

/**
 * Add warning alert action creator
 *
 * @method addWarningAlert
 * @memberOf alert.actions
 *
 * @param {String} text - The text for the alert
 * @return {Object}
 */
const addWarningAlert = (text) => privateApi.addAlert(text, WARNING);

/**
 * Remove alert action creator
 *
 * @method removeAlert
 * @memberOf alert.actions
 *
 * @param {Number} index - The index in the array to remove
 * @return {Object}
 */
const removeAlert = (index) => ({
  payload: {
    index,
  },
  type: REMOVE_ALERT,
});

export {
  addAlert,
  addDangerAlert,
  addInfoAlert,
  addSuccessAlert,
  addWarningAlert,
  removeAlert,
};
