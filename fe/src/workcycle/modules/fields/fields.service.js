/**
 * @namespace fields.service
 */

// services
import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

const fieldsService = {};

 // create field
fieldsService.createField = (workspaceId, boardId, field) => {
  const path = apiEndpointsService.normalizeUrl(API.FIELDS.CREATE, {
    workspaceId,
    boardId,
  });

  const options = {
    body: field,
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

// update field
fieldsService.updateField = (workspaceId, boardId, fieldId, field) => {
  const path = apiEndpointsService.normalizeUrl(API.FIELDS.UPDATE, {
    workspaceId,
    boardId,
    fieldId,
  });

  const options = {
    body: field,
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

// delete field
fieldsService.deleteField = (workspaceId, boardId, fieldId) => {
  const path = apiEndpointsService.normalizeUrl(API.FIELDS.DELETE, {
    workspaceId,
    boardId,
    fieldId,
  });

  const options = {};

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

// clone field
fieldsService.cloneField = (workspaceId, boardId, fieldId) => {
  const path = apiEndpointsService.normalizeUrl(API.FIELDS.CLONE, {
    workspaceId,
    boardId,
    fieldId,
  });

  const options = {};

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

export default fieldsService;
