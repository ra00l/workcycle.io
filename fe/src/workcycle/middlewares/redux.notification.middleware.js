/**
 * @namespace middleware
 */
/**
 * @namespace middleware.redux
 */
/**
 * @namespace middleware.redux.notification
 */

// actions
import {addAlert} from '../modules/alerts/alert.actions';

// constants
import {
  DANGER,
  SUCCESS,
} from '../modules/alerts/alert.constants';

// services
import l10nService from '../modules/l10n/l10n.service';

/**
 * Get notification message and type
 *
 * @memberOf middleware.redux.notification
 * @param {Object} action - Redux action
 * @param {String} defaultStr - Default string key
 * @param {String} defaultType - Default notification type
 * @return {Object} notificationObj - Notification object with message, silent and type
 */
function getNotificationObject(action, defaultStr = 'ERROR', defaultType = DANGER) {
  const {
    meta: {
      notification: {
        message = defaultStr,
        silent = false,
        type = defaultType,
        messageArguments = {},
      } = {},
    } = {},
  } = action;

  return {
    message,
    messageArguments,
    silent,
    type,
  };
}

/**
 * Error manager middleware for redux
 *
 * @memberOf middleware.redux.notification
 * @function notificationMiddleware
 *
 * @param {Object} store - Redux store
 * @return {Function} Middleware action
 */
const notificationMiddleware = store => next => action => {
  let notificationObj;

  if ((action.error || action.success) && action.type !== '@@redux-form/SET_SUBMIT_FAILED') {
    if (action.error) {
      notificationObj = getNotificationObject(action, 'ERROR', DANGER);
    } else if (action.success) {
      notificationObj = getNotificationObject(action, 'SUCCESS', SUCCESS);
    }

    if (!notificationObj.silent) {
      // dispatch action to show notification
      store.dispatch(addAlert(l10nService.translate(
        notificationObj.message,
        notificationObj.messageArguments),
        notificationObj.type));
    }
  }

  return next(action);
};

export default notificationMiddleware;
