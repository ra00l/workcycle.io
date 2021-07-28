/**
 * @namespace boards.service
 */

// services
import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

const privateService = {};
const boardsService = {};

boardsService.getBoards = (workspace) => {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.LIST, {
    workspaceId: workspace,
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

boardsService.createBoard = (workspaceId, board) => {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.CREATE, {
    workspaceId,
  });

  const options = {
    body: board,
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

boardsService.updateBoard = (workspaceId, boardId, board, isGoal) => {
  const url = isGoal ? API.GOALS.GOAL : API.BOARDS.BOARD;
  const path = apiEndpointsService.normalizeUrl(url, {
    entityId: boardId,
    workspaceId,
  });

  const options = {
    body: board,
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

boardsService.removeBoard = (workspaceId, boardId) => {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.DELETE, {
    boardId,
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

boardsService.cloneBoard = (workspaceId, boardId, isGoal, folderId, boardName) => {
  let path = apiEndpointsService.normalizeUrl(API.BOARDS.CLONE, {
    boardId,
    workspaceId,
  });

  if (isGoal) {
    path = apiEndpointsService.normalizeUrl(API.GOALS.CLONE, {
      boardId,
      workspaceId,
    });
  }

  const options = {
    body: {},
  };

  if (!isGoal && folderId) {
    options.body.idFolder = folderId;
  }

  if (!isGoal && boardName) {
    options.body.name = boardName;
  }

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

boardsService.saveBoardAsTemplate = (workspaceId, boardId) => {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.SAVE_TEMPLATE, {
    boardId,
    workspaceId,
  });

  const options = {
    body: {},
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

boardsService.getChanges = (workspaceId, boardId, pageNum) => {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.GET_CHANGES, {
    boardId,
    workspaceId,
    pageNum,
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

boardsService.getAvailableTemplates = (workspaceId) => {
  const path = apiEndpointsService.normalizeUrl(API.BOARDS.GET_TEMPLATES, {
    workspaceId,
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

boardsService.getBoardFields = (workspaceId, boardId, isGoal) => {
  const url = isGoal ? API.GOALS.GET_FIELDS : API.BOARDS.GET_FIELDS;

  const path = apiEndpointsService.normalizeUrl(url, {
    workspaceId,
    boardId,
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

export default boardsService;
