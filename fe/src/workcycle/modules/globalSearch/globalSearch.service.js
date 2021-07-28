// services
import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

const globalSearchService = {};

// create nest
globalSearchService.search = (workspaceId, inBoard, query) => {
  const path = apiEndpointsService.normalizeUrl(API.GLOBAL_SEARCH, {
    workspaceId,
    boardId: inBoard,
  });

  const searchQuery = {};
  
  if (query.global) {
    searchQuery.q = query.global;
  }
  if (query.board) {
    searchQuery.board = query.board;
  }
  if (query.nest) {
    searchQuery.nest = query.nest;
  }
  if (query.item) {
    searchQuery.item = query.item;
  }

  const options = {
    body: {
      ...searchQuery,
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

export default globalSearchService;
