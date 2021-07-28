/**
 * @namespace workItem.service
 */

// services
import api from '../../api/api.ws.service';
import apiEndpointsService from '../../api/api.endpoints';

// constants
import {API} from '../../api/api.urls';

/**
 * workItem service
 *
 * @memberOf workItem.service
 * @name workItemService
 * @const {Object}
 */
const workItemService = {};

workItemService.uploadFileForItem = (boardId, workItemId, filePayload) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.UPLOAD_FILE_FOR_ITEM, {
    boardId,
    workItemId,
  });

  const options = {
    body: filePayload,
    noAutoHeaders: true,
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

workItemService.removeFileFromItem = (boardId, workItemId, fileId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.REMOVE_FILE, {
    boardId,
    fileId,
    workItemId,
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

workItemService.getWorkItem = (boardId, workItemId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.GET_WORKITEM, {
    boardId,
    workItemId,
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

workItemService.addComment = (boardId, workItemId, comment) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.ADD_COMMENT, {
    boardId,
    workItemId,
  });

  const options = {
    body: comment,
    noAutoHeaders: true,
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

workItemService.updateComment = (boardId, workItemId, commentId, comment) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.UPDATE_COMMENT, {
    boardId,
    commentId,
    workItemId,
  });

  const options = {
    body: comment,
    noAutoHeaders: true,
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


workItemService.removeComment = (boardId, workItemId, commentId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.REMOVE_COMMENT, {
    boardId,
    commentId,
    workItemId,
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

/**
 * Create workItem
 *
 * @memberOf workItem.service
 * @method createWorkitem
 *
 * @param {String} boardId - board id
 * @param {String} workItem - workItem that will be created
 * @return {Promise} Promise wrapper over Api call
 */
workItemService.createWorkItem = (boardId, workItem, nestId) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.CREATE, {
    boardId,
  });

  const options = {
    body: {...workItem, newNest: nestId},
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

/**
 * Update workitem
 *
 * @memberOf workItem.service
 * @method updateWorkItem
 *
 * @param {String} boardId - board id
 * @param {String} workItemId - workitem id
 * @param {Object} newWorkitem - the new workitem values
 * @return {Promise} Promise wrapper over Api call
 */
workItemService.updateWorkItem = (boardId, workItemId, newWorkitem) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.UPDATE, {
    boardId,
    workItemId,
  });

  const options = {
    body: newWorkitem,
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

/**
 * Update custom field workitem
 *
 * @memberOf workItem.service
 * @method updateWorkItem
 *
 * @param {String} boardId - board id
 * @param {String} workItemId - workitem id
 * @param {Object} newWorkitem - the new workitem values
 * @return {Promise} Promise wrapper over Api call
 */
workItemService.updateWorkItemCustomField = (boardId, workItemId, newWorkitem) => {
  const path = apiEndpointsService.normalizeUrl(API.WORK_ITEMS.UPDATE_CUSTOM_FIELD, {
    boardId,
    workItemId,
  });

  const options = {
    body: newWorkitem,
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

export default workItemService;
