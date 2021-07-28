/**
 * @namespace l10n.reducers
 */

import {combineReducers} from 'redux';

// services
import l10nService from './l10n.service';

// constants
import {
  RECEIVE_LOCALE,
  RECEIVE_LOCALE_ERROR,
  REQUEST_LOCALE,
} from './l10n.constants';

/**
 * Prefix for logging
 *
 * @memberOf l10n.reducers
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[l10n.reducer]';

/**
 * Reducer Initial State
 *
 * @memberOf l10n.reducers
 * @const {Object}
 * @default
 */
const INITIAL_STATE = {
  data: null,
  isFetching: false,
  locale: null,
};

/**
 * Reducer for l10n based on locale
 *
 * @private
 * @memberOf l10n.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function l10n(state = INITIAL_STATE, action) {
  const {
    type,
    data,
    locale,
  } = action;

  switch (type) {
    case RECEIVE_LOCALE:
      l10nService.prepareTranslate(locale, data);

      return Object.assign({}, state, {
        data: data,
        isFetching: false,
        locale: locale,
      });
    case RECEIVE_LOCALE_ERROR:
      return Object.assign({}, state, {
        data: null,
        isFetching: false,
        locale: locale,
      });
    case REQUEST_LOCALE:
      return Object.assign({}, state, {
        data: null,
        isFetching: true,
        locale: locale,
      });
    default:
      return state;
  }
}

/**
 * Reducer for l10n. Listens to all actions and prepares reduced objects for state.
 *
 * @memberOf l10n.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function localize(state = {}, action) {
  switch (action.type) {
    case RECEIVE_LOCALE:
    case RECEIVE_LOCALE_ERROR:
    case REQUEST_LOCALE:
      return Object.assign({}, state, {
        [action.locale]: l10n(state[action.locale], action),
        currentLocale: action.locale,
      });
    default:
      return state;
  }
}

export default localize;
