/**
 * @namespace l10n.service
 */

import Polyglot from 'node-polyglot';

// services
import api from '../api/api.ws.service';

// constants
import {DEFAULT_LOCALE} from './l10n.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf l10n.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[l10n.service]';

/**
 * polyglot instance (used for translate)
 *
 * @private
 * @memberOf l10n.service
 */
let polyglot;

/**
 * l10n service
 *
 * @memberOf l10n.service
 * @name l10nService
 * @const {Object}
 */
const l10nService = {};

/**
 * polyglot instance (used for translate)
 *
 * @memberOf l10n.service
 * @name polyglot
 */
l10nService.polyglot = {};

/**
 * Retrieve file with locale strings
 *
 * @memberOf l10n.service
 * @method get
 *
 * @param {String} locale - Locale to use
 * @return {Promise} Promise wrapper over Api call
 */
l10nService.get = (locale = DEFAULT_LOCALE) => {
  let localeEndpoint = `/l10n/${locale}.json`;
  // file name is lowercase
  localeEndpoint = localeEndpoint.toLowerCase();

  return new Promise((resolve, reject) => {
    api.get(localeEndpoint, {isStatic: true})
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });

  });
};

/**
 * Prepare translation
 *
 * @memberOf l10n.service
 *
 * @param {String} locale - The locale
 * @param {Object} data - object with key as STR and value as localised value
 */
l10nService.prepareTranslate = (locale = DEFAULT_LOCALE, data) => {

  l10nService.polyglot = new Polyglot({
    locale: locale,
    phrases: data,
  });
};

/**
 * @description Translate string
 * @memberOf l10n.service
 *
 * @param {String} str - String Key
 * @param {Object} interpolateObj - Properties for string interpolation
 *
 * @return {String}
 */
l10nService.translate = (str, interpolateObj = {}) => {

  if (l10nService.polyglot && l10nService.polyglot.t) {
    return l10nService.polyglot.t(str, interpolateObj);
  }

  return '';
};

export default l10nService;
