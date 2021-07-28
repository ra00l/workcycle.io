// services
import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

const privateService = {};
const foldersService = {};

foldersService.createFolder = (workspaceId, folder, type) => {
  const path = apiEndpointsService.normalizeUrl(type === 0 ? API.FOLDERS.CREATE_BOARD : API.FOLDERS.CREATE_BOARD, {
    workspaceId,
  });

  const options = {
    body: folder,
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

foldersService.updateFolder = (workspaceId, folderId, folder) => {
  const path = apiEndpointsService.normalizeUrl(API.FOLDERS.FOLDER, {
    folderId,
    workspaceId,
  });

  const options = {
    body: folder,
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

foldersService.removeFolder = (workspaceId, folderId) => {
  const path = apiEndpointsService.normalizeUrl(API.FOLDERS.DELETE, {
    folderId,
    workspaceId,
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

export default foldersService;
