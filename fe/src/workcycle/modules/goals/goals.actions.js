import keyBy from 'lodash.keyby';
import orderBy from 'lodash.orderby';

import {
  REQUEST_GOALS,
  RECEIVED_GOALS,
  RECEIVED_GOALS_ERROR,
  ADD_GOAL,
  UPDATE_GOAL_COMPLETION,
  UPDATED_GOAL,
  INVALIDATE_GOALS,
  UPDATE_GOAL_DUE_DATE,
  ADD_ITEM_TO_GOAL,
  REMOVE_ITEM_FROM_GOAL,
  REMOVE_GOAL,
} from './goals.constants';

// services
import goalsService from './goals.service';

const privateService = {};

// Private area
// -------------

privateService.receive = (data) => {
  const sortedGoals = [];
  const goals = keyBy(data, 'id');

  const orderByGoal = orderBy(data, 'order', 'asc');

  orderByGoal.map(goal => {
    if (!goal.idFolder) {
      sortedGoals.push(goal.id);
    }
  });

  return {
    payload: {
      data: goals,
      sorted: sortedGoals,
    },
    type: RECEIVED_GOALS,
  };
};

privateService.receiveError = (errorData) => ({
  payload: {
    error: errorData,
  },
  type: RECEIVED_GOALS_ERROR,
});

privateService.getGoals = (workspaceId) => (dispatch, getState) => {
  // request board
  dispatch({
    type: REQUEST_GOALS,
  });

  // call api
  goalsService.getGoals(workspaceId)
    .then(response => {
      // TODO: add goals folder into consideration
      // dispatch(setFolders(privateService.getFolders(response.folderList, response.boardList)));
      dispatch(privateService.receive(response.boardList));
    }, err => {
      dispatch(privateService.receiveError(err));
    });
};

privateService.shouldGet = (state) => {
  const entityFromStore = state.goals;

  // there is an action in progress or we have data in the store
  if (entityFromStore.actionInProgress || entityFromStore.data) {
    return false;
  }

  return true;
};

// End private area
// -----------------
const updateGoalCompletion = (goalId, itemId, fromCompletion, toCompletion) => (dispatch, getState) =>
  dispatch({
    type: UPDATE_GOAL_COMPLETION,
    payload: {
      goalId,
      itemId,
      fromCompletion,
      toCompletion,
    },
  });

const addItemToGoal = (goalId, itemId) => (dispatch, getState) =>
  dispatch({
    type: ADD_ITEM_TO_GOAL,
    payload: {
      goalId,
      itemId,
    },
  });

const removeItemFromGoal = (goalId, itemId) => (dispatch, getState) =>
  dispatch({
    type: REMOVE_ITEM_FROM_GOAL,
    payload: {
      goalId,
      itemId,
    },
  });

const getGoals = (workspaceId) => (dispatch, getState) => {
  if (privateService.shouldGet(getState())) {
    return dispatch(privateService.getGoals(workspaceId));
  }
};

const updateGoalDueDate = (goalId, date) => (dispatch, getState) =>
  dispatch({
    type: UPDATE_GOAL_DUE_DATE,
    payload: {
      goalId,
      date,
    },
  });

const invalidateGoals = () => (dispatch, getState) =>
  dispatch({
    type: INVALIDATE_GOALS,
  });

const updateGoal = (goalId, goal) => (dispatch, getState) =>
  dispatch({
    type: UPDATED_GOAL,
    payload: {
      goalId,
      data: goal,
    },
  });

const removeGoal = (boardId) => (dispatch, getState) =>
  dispatch({
    type: REMOVE_GOAL,
    payload: {
      goalId: boardId,
    },
  });

const addGoal = (goal) => (dispatch, getState) => {
  const payload = {
    data: goal,
  };

  return dispatch({
    type: ADD_GOAL,
    payload,
  });
};

export {
  getGoals,
  addGoal,
  updateGoalCompletion,
  updateGoal,
  invalidateGoals,
  updateGoalDueDate,
  addItemToGoal,
  removeItemFromGoal,
  removeGoal,
};
