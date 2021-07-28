import api from '../api/api.ws.service';
import apiEndpointsService from '../api/api.endpoints';

// constants
import {API} from '../api/api.urls';

const goalsService = {};

goalsService.createGoal = (workspaceId, goal) => {
  const path = apiEndpointsService.normalizeUrl(API.GOALS.CREATE, {
    workspaceId,
  });

  const options = {
    body: goal,
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

goalsService.getGoals = (workspace) => {
  const path = apiEndpointsService.normalizeUrl(API.GOALS.LIST, {
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

export default goalsService;
