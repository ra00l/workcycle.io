/**
 * @namespace service.utils
 */

/**
 * Prefix for logging
 *
 * @memberOf service.utils
 *
 * @private
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[utils.service]';

/**
 * Given an object returns a key=value uri encoded string to use as url params
 *
 * @function serializeObjectToUrlParams
 * @memberOf service.utils
 *
 * @param {Object} paramsObject The object to use for generating the url params
 * @return {String}
 * @example
 *  const myObj = {firstName: 'John', lastName: 'Doe'};
 *  serializeObjectToUrlParams(myObj); // 'firstName=John&lastName=Doe'
 */
function serializeObjectToUrlParams(paramsObject) {
  const params = [];

  for (const param in paramsObject) {
    params.push(`${param}=${paramsObject[param]}`);
  }

  return params.join('&');
}

export {
  serializeObjectToUrlParams,
};
