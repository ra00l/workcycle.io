/**
 * @namespace l10n
 */

/**
 * @namespace l10n.actions
 */

import {
  DEFAULT_LOCALE,
  REQUEST_LOCALE,
  RECEIVE_LOCALE,
  RECEIVE_LOCALE_ERROR,
} from './l10n.constants';

// services
import l10nService from './l10n.service';


/**
 * Prefix for logging
 *
 * @private
 * @memberOf l10n.actions
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[l10n.actions]';

/**
 * Private service
 *
 * @private
 * @memberOf l10n.actions
 * @const {Object}
 * @default
 */
const privateService = {};

// Private area
// -------------

/**
 * Success callback when retrieving locale
 *
 * @private
 * @memberOf l10n.actions
 *
 * @param {String} locale - locale
 * @param {Object<String>} data - Strings
 * @return {Object} Redux action
 */
privateService.receive = (locale, data) => ({
  data,
  locale,
  type: RECEIVE_LOCALE,
});

/**
 * Error callback when retrieving locale
 *
 * @private
 * @memberOf l10n.actions
 *
 * @param {String} locale - locale
 * @param {Object<String>} data - Error object
 * @return {Object} Redux action
 */
privateService.receiveError = (locale, data) => ({
  data,
  locale,
  type: RECEIVE_LOCALE_ERROR,
});

/**
 * Request locale action
 *
 * @private
 * @memberOf l10n.actions
 *
 * @param {String} locale - locale
 * @return {Object} Redux action
 */
privateService.request = (locale) => ({
  locale,
  type: REQUEST_LOCALE,
});

/**
 * Make request to get locale strings
 *
 * @private
 * @memberOf l10n.actions
 *
 * @param {String} locale - locale
 * @return {Function}
 */
privateService.executeGet = (locale) => (dispatch) => {
  dispatch(privateService.request(locale));

  l10nService.get(locale)
    .then(response => {
      dispatch(privateService.receive(locale, response));
    }, err => {
      dispatch(privateService.receiveError(locale, err));
    });
};

/**
 * Determine if we need to make request for getting locale
 *
 * @private
 * @memberOf l10n.actions
 *
 * @param {Object} state - current state from store
 * @param {String} locale - locale
 * @return {Boolean}
 */
privateService.shouldGet = (state, locale) => {
  const localeData = state.l10n[locale];

  if (!localeData) {
    return true;
  }
  if (localeData.isFetching) {
    return false;
  }

  return true;
};

// End private area
// -----------------

/**
 * Get locale only if is needed. Basically we make request only if we don't have locale received.
 *
 * @memberOf l10n.actions
 * @function getIfNeeded
 *
 * @param {String} locale - locale
 * @return {Function}
 */
const getIfNeeded = (locale = DEFAULT_LOCALE) => (dispatch, getState) => {
  if (privateService.shouldGet(getState(), locale)) {
    return dispatch(privateService.executeGet(locale));
  }
};

export {
  getIfNeeded as getLocale,
};
