/**
 * l10n constants
 *
 * @namespace l10n.constants
 */

/**
 * Default locale
 *
 * @memberOf l10n.constants
 * @name DEFAULT_LOCALE
 * @const {String}
 * @default 'en'
 */
const DEFAULT_LOCALE = 'en';

/**
 * Request locale action name
 *
 * @memberOf L10n.actions
 * @name REQUEST_LOCALE
 * @const {String}
 * @default 'REQUEST_LOCALE'
 */
const REQUEST_LOCALE = '@l10n/REQUEST_LOCALE';

/**
 * Receive locale (success) action name
 *
 * @memberOf L10n.actions
 * @name RECEIVE_LOCALE
 * @const {String}
 * @default 'RECEIVE_LOCALE'
 */
const RECEIVE_LOCALE = '@l10n/RECEIVE_LOCALE';

/**
 * Receive locale (error) action name
 *
 * @memberOf L10n.actions
 * @name RECEIVE_LOCALE_ERROR
 * @const {String}
 * @default 'RECEIVE_LOCALE_ERROR'
 */
const RECEIVE_LOCALE_ERROR = '@l10n/RECEIVE_LOCALE_ERROR';

export {
  DEFAULT_LOCALE,
  REQUEST_LOCALE,
  RECEIVE_LOCALE,
  RECEIVE_LOCALE_ERROR,
};
