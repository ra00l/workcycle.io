/**
 * @namespace workspace.service
 */

// services
import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf board.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[workspace.service]';

/**
 * board service
 *
 * @memberOf board.service
 * @name boardService
 * @const {Object}
 */
const workspaceService = {};

/**
 * get board
 *
 * @memberOf board.service
 * @method getBoard
 *
 * @param {String} workspace - workspace id
 * @param {String} boardId - board id
 * @return {Promise} Promise wrapper over Api call
 */
workspaceService.getWorkspace = (workspaceId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORKSPACES.DETAIL, {
    workspaceId: workspaceId,
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

workspaceService.getWorkspaceList = () => {
  const path = API.WORKSPACES.LIST;

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

workspaceService.createWorkspace = (workspace) => {
  const path = apiEndpointsService.normalizeUrl(API.WORKSPACES.CREATE, {

  });

  const options = {
    body: workspace,
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

workspaceService.updateWorkspace = (id, workspace) => {
  const path = apiEndpointsService.normalizeUrl(API.WORKSPACES.DETAIL, {
    workspaceId: id,
  });

  const options = {
    body: workspace,
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


workspaceService.getWorkspaceMembers = (workspaceId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORKSPACES.MEMBERS, {
    workspaceId: workspaceId,
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

workspaceService.updateMembers = (workspaceId, members) => {
  const path = apiEndpointsService.normalizeUrl(API.WORKSPACES.MEMBERS, {
    workspaceId: workspaceId,
  });

  const options = {
    body: members,
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

workspaceService.deleteWorkspace = (workspaceId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORKSPACES.DELETE, {
    workspaceId: workspaceId,
  });

  return new Promise((resolve, reject) => {
    api.delete(path)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

export default workspaceService;
