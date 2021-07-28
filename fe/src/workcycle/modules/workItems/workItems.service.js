// services
import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

const workItemsService = {};

workItemsService.deleteWorkItem = (workItemId, boardId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.DELETE, {
    boardId,
    workItemId,
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

workItemsService.orderWorkItem = (boardId, workItemId, nestId, orderId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.UPDATE, {
    boardId,
    workItemId,
  });

  const options = {
    body: {
      idNest: nestId,
      order: orderId,
    },
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

workItemsService.addChildOf = (boardId, workItemId, parent) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.UPDATE, {
    boardId,
    workItemId,
  });

  const options = {
    body: {
      idNest: parent.idNest,
      idBoard: parent.idBoard,
      idParent: parent.idParent,
    },
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

export default workItemsService;
