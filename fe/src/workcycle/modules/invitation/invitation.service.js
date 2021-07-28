/**
 * @namespace register.service
 */

// services
import api from '../api/api.ws.service';

// constants
import {API} from '../api/api.urls';
import apiEndpointsService from '../api/api.endpoints';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf register.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[invitation.service]';

/**
 * register service
 *
 * @memberOf register.service
 * @name registerService
 * @const {Object}
 */
const invitationService = {};

invitationService.getFromToken = (token) => {
  const path = apiEndpointsService.normalizeUrl(API.INVITATION.GET, {
    token,
  });

  return new Promise((resolve, reject) => {
    api.get(path)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });

  });
};

/**
 * Registration call
 *
 * @memberOf register.service
 * @method register
 *
 * @param {Object} account - account information
 * @return {Promise} Promise wrapper over Api call
 */
invitationService.acceptInvitation = (token, account) => {

  const path = apiEndpointsService.normalizeUrl(API.INVITATION.ACCEPT, {
    token,
  });

  const options = {
    body: {
      ...account,
    },
  };

  return new Promise((resolve, reject) => {
    api.post(path, options)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });

  });
};

export default invitationService;
