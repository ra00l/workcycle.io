/**
 * @namespace api.endpoints.service
 */

/**
 * Prefix for logging
 *
 * @private
 * @memberOf api.endpoints.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[api.endpoints.service]';

/**
 * api endpoints service
 *
 * @memberOf api.endpoints.service
 * @name dashboardService
 * @const {Object}
 */
const apiEndpointsService = {};

/**
 * get goals with minimal information call
 *
 * @memberOf api.endpoints.service
 * @method getGoals
 *
 * @param {String} url - the url to normalize
 * @param {Object} configObject - params object
 * @return {String}
 */
apiEndpointsService.normalizeUrl = (url, configObject) => {
  const link = url.supplant(configObject);

  return link;
};

export default apiEndpointsService;
