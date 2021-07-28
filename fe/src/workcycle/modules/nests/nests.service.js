/**
 * @namespace nests.service
 */

// services
import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

/**
 * nests service
 *
 * @memberOf nests.service
 * @name workItemService
 * @const {Object}
 */
const nestsService = {};

// create nest
nestsService.createNest = (boardId, nest) => {
  const path = apiEndpointsService.normalizeUrl(API.NEST.CREATE, {
    boardId,
  });

  const options = {
    body: nest,
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

// update nest
nestsService.updateNest = (boardId, nestId, updatedNest) => {
  const path = apiEndpointsService.normalizeUrl(API.NEST.UPDATE, {
    boardId,
    nestId,
  });

  const options = {
    body: updatedNest,
  };

  return new Promise((resolve, reject) => {
    api.put(path, options)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

// remove nest
nestsService.removeNest = (boardId, nestId) => {
  const path = apiEndpointsService.normalizeUrl(API.NEST.DELETE, {
    boardId,
    nestId,
  });

  const options = {
    body: {},
  };

  return new Promise((resolve, reject) => {
    api.delete(path, options)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

// duplicate nest
nestsService.duplicateNest = (boardId, nestId, newNest) => {
  const path = apiEndpointsService.normalizeUrl(API.NEST.CLONE, {
    boardId,
    nestId,
  });

  const options = {
    body: newNest,
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

export default nestsService;
