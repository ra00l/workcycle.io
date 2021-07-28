import {fromJS, List} from 'immutable';

import {
  ADD_CHILD_WORKITEM,
  REMOVE_CHILD_WORKITEM,
  ADD_WORKITEMS,
  // DELETE_WORKITEM_SUCCESS,
  UPDATE_WORKITEM,
  UPDATE_CUSTOM_FIELD_REQUEST,
  UPDATE_CUSTOM_FIELD_SUCCESS,
  UPDATE_CUSTOM_FIELD_ERROR,
  CLONE_WORKITEM,
  CLONE_WORKITEM_SUCCESS,
  CLONE_WORKITEM_ERROR,
  ORDER_CHILD_WORKITEM_SUCCESS,
  CONVERT_TO_WORKITEM_SUCCESS,
  ADD_CHILD_OF_WORKITEM_SUCCESS,
  SET_DEPENDENCY_FIELD,
} from './workItems.constants';
import {
  WORKITEM_ADD_COMMENT_RECEIVE_SUCCESS,
  WORKITEM_REMOVE_COMMENT_RECEIVE_SUCCESS,
} from './workItem.constants';

const INITIAL_STATE = fromJS({
  data: {},
  actionInProgress: false,
});

const addChildOfItem = (state, action) => {
  const {
    workItemId,
    parentId,
    previousParentId,
  } = action.payload;

  const parentListOfItems = state.getIn(['data', `${parentId}`, 'items']);
  let listAfterIsInserted = List();
  if (parentListOfItems) {
    listAfterIsInserted = parentListOfItems.insert(parentListOfItems.size, workItemId);
  }

  if (previousParentId) {
    const indexToRemove = state.getIn(['data', `${previousParentId}`, 'items']).findIndex(id => id === workItemId);
    const listAfterIsRemoved = state.getIn(['data', `${previousParentId}`, 'items']).delete(indexToRemove);

    return state.withMutations(
      (nextState) =>
        nextState
          .setIn(['data', `${workItemId}`, 'idParent'], parentId)
          .setIn(['data', `${parentId}`, 'items'], listAfterIsInserted)
          .setIn(['data', `${previousParentId}`, 'items'], listAfterIsRemoved)
    );
  }

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${workItemId}`, 'idParent'], parentId)
        .setIn(['data', `${parentId}`, 'items'], listAfterIsInserted)
  );
};

const convertToWorkItem = (state, action) => {
  const {
    nestId,
    previousParentId,
    workItemId,
  } = action.payload;

  const index = state.getIn(['data', `${previousParentId}`, 'items']).findIndex(id => id === workItemId);
  const list = state.getIn(['data', `${previousParentId}`, 'items']).delete(index);

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${workItemId}`, 'idParent'], null)
        .setIn(['data', `${previousParentId}`, 'items'], list)
  );
};

const orderChildWorkItem = (state, action) => {
  const {
    childWorkItemId,
    childWorkItemOrder,
    workItemId,
  } = action.payload;

  const index = state.getIn(['data', `${workItemId}`, 'items']).findIndex(id => id === childWorkItemId);
  const sortedItems = state.getIn(['data', `${workItemId}`, 'items']).delete(index);

  // insert into the correct position
  const list = sortedItems.insert(childWorkItemOrder, childWorkItemId);

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${childWorkItemId}`, 'idParent'], workItemId)
        .setIn(['data', `${childWorkItemId}`, 'order'], childWorkItemOrder)
        .setIn(['data', `${workItemId}`, 'items'], list)
  );
};

const addChildWorkItem = (state, action) => {
  const {
    parentWorkItemId,
    childWorkItemId,
  } = action.payload;

  const currentItemsList = state.getIn(['data', `${parentWorkItemId}`, 'items']);
  const itemsList = currentItemsList.insert(currentItemsList.size, childWorkItemId);

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${parentWorkItemId}`, 'items'], itemsList)
  );
};

const removeChildWorkItem = (state, action) => {
  const {
    parentWorkItemId,
    childWorkItemId,
  } = action.payload;

  const index = state.getIn(['data', `${parentWorkItemId}`, 'items']).findIndex(item => item === childWorkItemId);
  const childrenList = state.getIn(['data', `${parentWorkItemId}`, 'items']).delete(index);

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${parentWorkItemId}`, 'items'], childrenList)
  );
};

const addComment = (state, action) => {
  const {workItemId} = action.payload;
  const currentNumberOfComments = state.getIn(['data', `${workItemId}`, 'comment']);
  const numberOfComments = currentNumberOfComments + 1;

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${workItemId}`, 'comment'], numberOfComments)
  );
};

const removeComment = (state, action) => {
  const {workItemId} = action.payload;
  const currentNumberOfComments = state.getIn(['data', `${workItemId}`, 'comment']);
  const numberOfComments = currentNumberOfComments - 1;

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${workItemId}`, 'comment'], numberOfComments)
  );
};

const cloneWorkItem = (state, action) => {
  const {
    workItemId,
    workItem,
  } = action.payload;

  let newSortedItems = [];

  if (workItem.idParent) {
    const parentWorkItem = state.getIn(['data', `${workItemId}`]);
    const parentWorkItemSortedItems = parentWorkItem.get('sortedWorkItems');

    newSortedItems = parentWorkItemSortedItems.insert(parentWorkItemSortedItems.size, workItemId);
  }

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${workItem.idParent}`, 'items'], newSortedItems)
        .setIn(['data', `${workItemId}`], fromJS(workItem))
  );
};

const setDependencyField = (state, action) => {
  const {
    workItemId,
    fieldId,
    newValue,
  } = action.payload;

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(
          ['data', `${action.payload.workItemId}`, `${action.payload.fieldId}`],
          fromJS(action.payload.newValue)
        )
  );
};

const workItems = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_WORKITEMS:
      return state.withMutations(
        (nextState) =>
          nextState
            .mergeDeepIn(['data'], fromJS(action.payload.data))
      );
    case CLONE_WORKITEM:
    case UPDATE_CUSTOM_FIELD_REQUEST:
      return state.withMutations(
        (nextState) =>
        nextState
          .set('actionInProgress', true)
      );
    case CLONE_WORKITEM_SUCCESS:
      return cloneWorkItem(state, action);
    case UPDATE_CUSTOM_FIELD_SUCCESS:
      return state.withMutations(
        (nextState) =>
          nextState
            .setIn(['data', `${action.payload.workItemId}`, action.payload.fieldId], action.payload.fieldValue)
      );
    case CLONE_WORKITEM_ERROR:
    case UPDATE_CUSTOM_FIELD_ERROR:
      return state.withMutations(
        (nextState) =>
        nextState
          .set('actionInProgress', false)
      );
    case ADD_CHILD_WORKITEM:
      return addChildWorkItem(state, action);
    case REMOVE_CHILD_WORKITEM:
      return removeChildWorkItem(state, action);
    // case DELETE_WORKITEM_SUCCESS:
    //   return deleteWorkItem(state, action);
    case UPDATE_WORKITEM:
      return state.withMutations(
        (nextState) =>
          nextState
            .mergeDeepIn(['data', `${action.payload.workItemId}`], fromJS(action.payload.workItem))
      );
    case SET_DEPENDENCY_FIELD:
      return setDependencyField(state, action);
    case WORKITEM_ADD_COMMENT_RECEIVE_SUCCESS:
      return addComment(state, action);
    case WORKITEM_REMOVE_COMMENT_RECEIVE_SUCCESS:
      return removeComment(state, action);
    case ORDER_CHILD_WORKITEM_SUCCESS:
      return orderChildWorkItem(state, action);
    case CONVERT_TO_WORKITEM_SUCCESS:
      return convertToWorkItem(state, action);
    case ADD_CHILD_OF_WORKITEM_SUCCESS:
      return addChildOfItem(state, action);
    default:
      return state;
  }
};

export default workItems;
