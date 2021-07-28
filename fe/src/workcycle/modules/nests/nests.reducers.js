import _remove from 'lodash.remove';
import {fromJS, Map} from 'immutable';

// constants
import {
  ADD_NEST,
  SET_NESTS,
  ADD_WORKITEM_TO_NEST,
  REMOVE_WORKITEM_FROM_NEST,
  ORDER_NEST_REQUEST,
  ORDER_NEST_REQUEST_SUCCESS,
  ORDER_NEST_REQUEST_FAILURE,
  ORDER_WORKITEM_IN_NEST,
  ORDER_WORKITEM_IN_DIFFERENT_NESTS,
  CREATE_NEST_REQUEST,
  CREATE_NEST_REQUEST_SUCCESS,
  CREATE_NEST_REQUEST_FAILURE,
  UPDATE_NEST_REQUEST,
  UPDATE_NEST_REQUEST_SUCCESS,
  UPDATE_NEST_REQUEST_FAILURE,
  REMOVE_NEST_REQUEST,
  REMOVE_NEST_REQUEST_SUCCESS,
  REMOVE_NEST_REQUEST_FAILURE,
  MOVE_NEST_REQUEST,
  MOVE_NEST_REQUEST_SUCCESS,
  MOVE_NEST_REQUEST_FAILURE,
} from './nests.constants';

import {CONVERT_TO_WORKITEM_SUCCESS} from './../workItems/workItems.constants';

const INITIAL_STATE = fromJS({
  data: null,
  sorted: null,
  actionInProgress: false,
});

const orderWorkItemInDifferentNests = (state, action) => {
  const {
    workItemId,
    fromNestId,
    toNestId,
    itemPosition,
  } = action.payload;

  // remove from the nest
  const index = state.getIn(['data', `${fromNestId}`, 'sortedWorkItems']).findIndex(id => id === workItemId);
  const sortedFromNestItems = state.getIn(['data', `${fromNestId}`, 'sortedWorkItems']).delete(index);
  const fromNestList = sortedFromNestItems;

  // add to the new nest
  const sortedToNestItems = state.getIn(['data', `${toNestId}`, 'sortedWorkItems']);
  const toNestList = sortedToNestItems.insert(itemPosition, workItemId);

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${fromNestId}`, 'sortedWorkItems'], fromNestList)
      .setIn(['data', `${toNestId}`, 'sortedWorkItems'], toNestList)
  );
};

const orderWorkItemInNest = (state, action) => {
  const {
    workItemId,
    nestId,
    itemPosition,
  } = action.payload;

  const index = state.getIn(['data', `${nestId}`, 'sortedWorkItems']).findIndex(id => id === workItemId);
  const sortedItems = state.getIn(['data', `${nestId}`, 'sortedWorkItems']).delete(index);

  // insert into the correct position
  const list = sortedItems.insert(itemPosition, workItemId);

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${nestId}`, 'sortedWorkItems'], list)
  );
};

const addWorkItem = (state, action) => {
  const {
    nestId,
    workItemId,
    workItemPosition,
  } = action.payload;

  let sortedItems = {};
  let list = {};

  if (workItemPosition) {
    // remove the workitem id from the list
    const index = state.getIn(['data', `${nestId}`, 'sortedWorkItems']).findIndex(id => id === workItemId);
    sortedItems = state.getIn(['data', `${nestId}`, 'sortedWorkItems']).delete(index);

    // insert into the correct position
    list = sortedItems.insert(workItemPosition, workItemId);
  } else {
    sortedItems = state.getIn(['data', `${nestId}`, 'sortedWorkItems']);
    list = sortedItems.insert(sortedItems.size, workItemId);
  }

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${nestId}`, 'sortedWorkItems'], list)
  );
};

const orderNest = (state, action) => {
  const {
    nestId,
    nestPosition,
  } = action.payload;

  // remove the nest id from the sorted list
  const index = state.get('sorted').findIndex(id => id === nestId);
  const sorted = state.get('sorted').delete(index);

  // insert into the correct position
  const list = sorted.insert(nestPosition, nestId);

  return state.withMutations((newState) =>
    newState
      .set('sorted', list)
      .set('actionInProgress', false));
};

const removeWorkItemFromNest = (state, action) => {
  const {
    nestId,
    workItemId,
  } = action.payload;

  const index = state.getIn(['data', `${nestId}`, 'sortedWorkItems']).findIndex(id => id === workItemId);

  if (index !== -1) {
    const sortedItems = state.getIn(['data', `${nestId}`, 'sortedWorkItems']).delete(index);

    return state.withMutations((newState) =>
      newState
        .setIn(['data', `${nestId}`, 'sortedWorkItems'], sortedItems)
    );
  }
  
  return state;
};

const removeNest = (state, action) => {
  const index = state.get('sorted').findIndex(id => id === action.payload.nestId);
  const sorted = state.get('sorted').delete(index);

  return state.withMutations((newState) =>
    newState
      .deleteIn(['data', `${action.payload.nestId}`])
      .set('sorted', sorted)
      .set('actionInProgress', false));
};

// -----------------------------------------------------------------------
// REDUCERS
// -----------------------------------------------------------------------

const nests = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_NEST:
      return state.withMutations(
        (nextState) =>
          nextState
            .updateIn(['sorted'], arr => arr.push(action.payload.nestId))
            .mergeIn(['data', `${action.payload.nestId}`], fromJS(action.payload.nest))
      );
    case SET_NESTS:
      return state.withMutations((newState) =>
        newState
          .merge(fromJS(action.payload))
      );
    case ADD_WORKITEM_TO_NEST:
      return addWorkItem(state, action);
    case REMOVE_WORKITEM_FROM_NEST:
      return removeWorkItemFromNest(state, action);
    case ORDER_NEST_REQUEST_SUCCESS:
      return orderNest(state, action);
    case ORDER_WORKITEM_IN_NEST:
      return orderWorkItemInNest(state, action);
    case ORDER_WORKITEM_IN_DIFFERENT_NESTS:
      return orderWorkItemInDifferentNests(state, action);
    case ORDER_NEST_REQUEST:
    case CREATE_NEST_REQUEST:
    case UPDATE_NEST_REQUEST:
    case REMOVE_NEST_REQUEST:
    case MOVE_NEST_REQUEST:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', true)
      );
    case CREATE_NEST_REQUEST_SUCCESS:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', false)
            .updateIn(['sorted'], arr => arr.push(action.payload.nestId))
            .mergeIn(['data', `${action.payload.nestId}`], fromJS(action.payload.nest))
      );
    case UPDATE_NEST_REQUEST_SUCCESS:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', false)
            .mergeIn(['data', `${action.payload.nestId}`], fromJS(action.payload.data))
      );
    case REMOVE_NEST_REQUEST_SUCCESS:
      return removeNest(state, action);
    case MOVE_NEST_REQUEST_SUCCESS:
      // remove the nest id from this store since the data from nest store is related to the current board
      return removeNest(state, action);
    case ORDER_NEST_REQUEST_FAILURE:
    case CREATE_NEST_REQUEST_FAILURE:
    case UPDATE_NEST_REQUEST_FAILURE:
    case REMOVE_NEST_REQUEST_FAILURE:
    case MOVE_NEST_REQUEST_FAILURE:
      return state.withMutations(
        (nextState) =>
        nextState
          .set('actionInProgress', false)
      );
    case CONVERT_TO_WORKITEM_SUCCESS:
      return addWorkItem(state, {
        payload: {
          nestId: action.payload.nestId,
          workItemId: action.payload.workItemId,
        },
      });
    default:
      return state;
  }
};

export default nests;
