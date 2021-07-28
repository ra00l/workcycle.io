import {fromJS, Map} from 'immutable';

// constants
import {
  ADD_GOAL,
  REQUEST_GOALS,
  RECEIVED_GOALS,
  RECEIVED_GOALS_ERROR,
  UPDATE_GOAL_COMPLETION,
  UPDATED_GOAL,
  INVALIDATE_GOALS,
  UPDATE_GOAL_DUE_DATE,
  ADD_ITEM_TO_GOAL,
  REMOVE_ITEM_FROM_GOAL,
  REMOVE_GOAL,
} from './goals.constants';

const INITIAL_STATE = fromJS({
  actionInProgress: false,
  data: null,
  sorted: [],
  error: null,
});

const emptyImmutableList = fromJS([]);

const addItemToGoal = (state, action) => {
  const {
    goalId,
    itemId,
  } = action.payload;

  const newTotalItems = state.getIn(['data', `${goalId}`, 'goalData', 'total']);

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${goalId}`, 'goalData', 'total'], newTotalItems + 1)
        .setIn(['data', `${goalId}`, 'goalData', 'goalStatuses', `${itemId}`], 0)
  );
};

const removeItemFromGoal = (state, action) => {
  const {
    goalId,
    itemId,
  } = action.payload;

  const newTotalItems = state.getIn(['data', `${goalId}`, 'goalData', 'total']);

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${goalId}`, 'goalData', 'total'], newTotalItems - 1)
        .deleteIn(['data', `${goalId}`, 'goalData', 'goalStatuses', `${itemId}`])
  );
};

const udpateGoalCompletion = (state, action) => {
  const {
    goalId,
    itemId,
    fromCompletion,
    toCompletion,
  } = action.payload;

  // update in the goalStatuses the itemId with the newValue

  // whe have the goalId in the store
  if (state.getIn(['data', `${goalId}`])) {
    return state.withMutations(
      (nextState) =>
        nextState
          .setIn(['data', `${goalId}`, 'goalData', 'goalStatuses', `${itemId}`], toCompletion)
    );
  }

  return state;
};

const removeGoal = (state, action) => {
  const index = state.get('sorted').findIndex(id => id === action.payload.goalId);
  let sorted = [];

  if (index !== -1) {
    sorted = state.get('sorted').delete(index);
  } else {
    sorted = state.get('sorted');
  }

  return state.withMutations((newState) =>
    newState
      .deleteIn(['data', action.payload.boardId])
      .set('sorted', sorted));
};

const updateGoalDueDate = (state, action) => {
  const {
    goalId,
    date,
  } = action.payload;
  
  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${goalId}`, 'dueDate'], date)
  );
};

const goals = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_GOAL:
      return state.withMutations(
        (nextState) =>
          nextState
            .updateIn(['sorted'], arr => arr.push(action.payload.data.id))
            .mergeIn(['data', `${action.payload.data.id}`], Map(action.payload.data))
      );
    case REQUEST_GOALS:
      return state.set('actionInProgress', true);
    case RECEIVED_GOALS:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', false)
            .merge(fromJS(action.payload))
      );
    case RECEIVED_GOALS_ERROR:
      return INITIAL_STATE.withMutations((newState) =>
        newState
          .set('data', emptyImmutableList)
          .set('sorted', emptyImmutableList)
        );
    case UPDATED_GOAL:
      return state.withMutations(
        (nextState) =>
          nextState
            .mergeIn(['data', `${action.payload.goalId}`], Map(action.payload.data))
      );
    case UPDATE_GOAL_DUE_DATE:
      return updateGoalDueDate(state, action);
    case UPDATE_GOAL_COMPLETION:
      return udpateGoalCompletion(state, action);
    case ADD_ITEM_TO_GOAL:
      return addItemToGoal(state, action);
    case REMOVE_ITEM_FROM_GOAL:
      return removeItemFromGoal(state, action);
    case REMOVE_GOAL:
      return removeGoal(state, action);
    case INVALIDATE_GOALS:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default goals;
