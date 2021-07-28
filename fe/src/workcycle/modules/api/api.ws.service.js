/**
 * @namespace api.ws
 */

import ApiClass from './api';

// services

// routes

// constants

/**
 * Prefix for logging
 *
 * @private
 * @memberOf api.vocm
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[api.ws.service]';

/**
 * @description ApiWs service
 * @memberOf api.ws
 * @const {Object}
 * @see api.ws.ApiWs
 *
 */
const apiWs = (() => {

  /**
   * @description Api WS class
   * @class ApiWsClass
   * @memberOf api.ws
   * @extends api.Api
   *
   */
  class ApiWsClass extends ApiClass {

    /**
     * Make request
     *
     * @memberOf api.ws.ApiWs
     * @method call
     *
     * @param {String} url - Endpoint
     * @param {Object} options - Request options
     * @return {Promise} Promise that wraps request
     */
    static call(url, options = {}) {
      const useOptions = Object.assign({}, getBaseReqOptions(), options);

      return new Promise((resolve, reject) =>
        super.call(url, useOptions)
          .then(response => {
            resolve(response);
          })
          .catch(reason => {
            reject(reason);
          })
      );
    }
  }

  /**
   * Get base request options
   *
   * @private
   * @memberOf api.ws.ApiWs
   * @method getBaseReqOptions
   *
   * @return {Object} Object with options for request
   */
  const getBaseReqOptions = () => ({
    // credentials: 'include',
    headers: {},
    mode: 'cors',
  });

  return ApiWsClass;
})();

export default apiWs;
