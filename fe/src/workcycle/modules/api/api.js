/**
 * @namespace api
 */

// services
import apiRequest from './api.request.service';
import {serializeObjectToUrlParams} from '../../services/utils.service';

// constants
import {SESSION_TOKEN} from '../auth/auth.constants';

/**
 * @private
 * @description Prefix for logging
 * @memberOf api
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[api.class]';

/**
 * Headers used when doing Api call
 *
 * @private
 * @memberOf api
 * @const {Object}
 * @default
 */
const apiHeaders = {};

/**
 * Headers that should be ignored when doing upload
 *
 * @private
 * @memberOf api
 * @const {Array<String>}
 * @default
 */
const uploadFileIgnoredHeaders = [
  'Content-Type',
];

/**
 * Base api url
 *
 * @private
 * @memberOf api
 * @const {String}
 * @default
 */
const BASE_API = '';

/**
 * @description Api class
 * @class Api
 * @memberOf api
 */
class ApiClass {

  /**
   * Make request
   *
   * @memberOf api.Api
   * @method call
   *
   * @param {String} url - Endpoint
   * @param {Object} options - Options for the call
   * @return {Promise} Promise for request
   */
  static call(url, options = {}) {
    const useOptions = Object.assign({}, apiPrivate.getBaseReqOptions(), options);

    apiPrivate.prepareFinalOptions(useOptions);
    url += useOptions.urlParams;

    if (!useOptions.noAutoHeaders) {
      useOptions.headers = Object.assign({}, useOptions.headers, {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      });
    }

    // add authorization token
    if (localStorage.getItem(SESSION_TOKEN)) {
      useOptions.headers.Authorization = `Bearer ${localStorage.getItem(SESSION_TOKEN)}`;
    }

    return apiRequest.handleRequest(url, useOptions);
  }

  /**
   * Make DELETE request
   *
   * @memberOf api.Api
   * @method delete
   *
   * @param {String} url - Endpoint
   * @param {Object} options - Options for the call
   * @return {Promise} Promise for request
   */
  static delete(url, options = {}) {
    options.method = 'DELETE';
    return this.call(url, options);
  }

  /**
   * Make GET request
   *
   * @memberOf api.Api
   * @method get
   *
   * @param {String} url - Endpoint
   * @param {Object} options - Options for the call
   * @return {Promise} Promise for request
   */
  static get(url, options = {}) {
    options.method = 'GET';
    return this.call(url, options);
  }

  /**
   * Make PATCH request
   *
   * @memberOf api.Api
   * @method patch
   *
   * @param {String} url - Endpoint
   * @param {Object} options - Options for the call
   * @return {Promise} Promise for request
   */
  static patch(url, options = {}) {
    options.method = 'PATCH';
    return this.call(url, options);
  }

  /**
   * Make POST request
   *
   * @memberOf api.Api
   * @method post
   *
   * @param {String} url - Endpoint
   * @param {Object} options - Options for the call
   * @return {Promise} Promise for request
   */
  static post(url, options = {}) {
    options.method = 'POST';
    return this.call(url, options);
  }

  /**
   * Make PUT request
   *
   * @memberOf api.Api
   * @method put
   *
   * @param {String} url - Endpoint
   * @param {Object} options - Options for the call
   * @return {Promise} Promise for request
   */
  static put(url, options = {}) {
    options.method = 'PUT';
    return this.call(url, options);
  }

  /**
   * Normalize url, makes sure to have complete url to api call
   *
   * @memberOf api.Api
   * @method normalizeUrl
   *
   *
   * @param {String} baseUrl - Base path for endpoint
   * @param {String} url - Endpoint
   * @return {String} url - Complete url for endpoint
   *
   * @example:
   *  normalizeUrl('test')  => baseUrl + '/test'
   *  normalizeUrl('/test') => baseUrl + '/test'
   *  normalizeUrl('http://localhost/api/test') => 'http://localhost/api/test'
   */
  static normalizeUrl(baseUrl = '', url = '') {
    url = url.trim();
    const indexProtocol = url.indexOf('http');

    if (indexProtocol !== 0) {
      // incomplete url received
      url = apiPrivate.concatUrl(baseUrl, url);
    }

    return url;
  }
}

// =====
// Private
// =====

/**
 * Private methods/properties for API
 *
 * @private
 * @memberOf api
 * @const {Object}
 * @default
 */
const apiPrivate = {};

/**
 * Get base request options
 *
 * @private
 * @memberOf api
 *
 * @return {Object}
 */
apiPrivate.getBaseReqOptions = () => ({
  cache: 'no-store',
  handleResponseStrategy: 'json',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

/**
 * Concatenate url, makes sure to concatenate base API url with current API url
 *
 * @private
 * @memberOf api
 *
 * @param {String} baseUrl - Bare path for endpoint
 * @param {String} url - Endpoint
 * @return {String} url - Complete path to endpoint
 *
 * @example:
 *  concatUrl('test')  => baseUrl + '/test'
 *  concatUrl('/test') => baseUrl + '/test'
 *
 */
apiPrivate.concatUrl = (baseUrl = '', url = '') => {
  const charIndex = url.indexOf('/');

  if (charIndex !== 0) {
    url = `/${url}`;
  }
  url = baseUrl + url;

  return url;
};

/**
 * Prepare final request object for fetch
 * Extends headers sent on request with ones that are retrieved earlier
 *
 * @memberOf api
 * @private
 *
 * @param {Object} options - Merged options for the call
 *
 */
apiPrivate.prepareFinalOptions = (options = {}) => {
  if (options.body && !(options.body instanceof FormData)) {
    // body should be string
    options.body = JSON.stringify(options.body);
  }

  if (!options.params) {
    options.params = {};
  }

  options.params.TS = `_${Date.now()}`;
  options.urlParams = `?${serializeObjectToUrlParams(options.params)}`;
};

export {
  apiPrivate,
};

export default ApiClass;
