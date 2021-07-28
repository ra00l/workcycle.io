import {fromJS} from 'immutable';

import {
  INVALIDATE_WORKITEM,
  GET_WORKITEM_REQUEST,
  GET_WORKITEM_RECEIVE_SUCCESS,
  GET_WORKITEM_RECEIVE_ERROR,
  WORKITEM_ADD_COMMENT_RECEIVE_SUCCESS,
  WORKITEM_REMOVE_COMMENT_RECEIVE_SUCCESS,
  WORKITEM_UPDATE_COMMENT_RECEIVE_SUCCESS,
  UPLOAD_FILE_ON_ITEM,
  WORKITEM_REMOVE_FILE_FROM_ITEM_RECEIVE_SUCCESS,
  WORKITEM_REMOVE_FILE_FROM_COMMENT_RECEIVE_SUCCESS,
} from './workItem.constants';

import {UPDATE_CUSTOM_FIELD_SUCCESS} from './workItems.constants';

const INITIAL_STATE = fromJS({
  data: {},
  actionInProgress: false,
});

const uploadFileOnItem = (state, action) => {
  const {
    file,
    workItemId,
  } = action.payload;

  const currentFileList = state.getIn(['data', `${workItemId}`, 'file']);
  const filesList = currentFileList.insert(0, fromJS(file));

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${workItemId}`, 'file'], filesList)
  );
};

const removeFileFromItem = (state, action) => {
  const {
    data: {
      id,
    },
    workItemId,
  } = action.payload;

  const index = state.getIn(['data', `${workItemId}`, 'file']).findIndex(item => item.get('id') === id);
  const fileList = state.getIn(['data', `${workItemId}`, 'file']).delete(index);

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${workItemId}`, 'file'], fileList)
  );
};

const removeFileFromComment = (state, action) => {
  const {
    data: {
      id,
      commentId,
    },
    workItemId,
  } = action.payload;

  const index = state.getIn(['data', `${workItemId}`, 'comment']).findIndex(item => item.get('id') === commentId);
  const currentCommentList = state.getIn(['data', `${workItemId}`, 'comment']);
  
  const currentFilesList = state.getIn(['data', `${workItemId}`, 'comment', `${index}`, 'files']);

  const fileIndex = currentFilesList.findIndex(item => item.get('id') === id);
  const newFilesList = currentFilesList.delete(fileIndex);

  const commentList = currentCommentList.setIn([`${index}`, 'files'], newFilesList);

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${workItemId}`, 'comment'], commentList)
  );
};

const addComment = (state, action) => {
  const {
    data,
    workItemId,
  } = action.payload;

  const currentCommentList = state.getIn(['data', `${workItemId}`, 'comment']);
  const commentList = currentCommentList.insert(0, fromJS(data));

  return state.withMutations(
    (nextState) =>
      nextState
        .setIn(['data', `${workItemId}`, 'comment'], commentList)
  );
};

const removeComment = (state, action) => {
  const {
    data: {
      id,
    },
    workItemId,
  } = action.payload;

  const index = state.getIn(['data', `${workItemId}`, 'comment']).findIndex(item => item.get('id') === id);
  const commentList = state.getIn(['data', `${workItemId}`, 'comment']).delete(index);

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${workItemId}`, 'comment'], commentList)
  );
};

const updateComment = (state, action) => {
  const {
    data: {
      id,
      comment,
      files,
    },
    workItemId,
  } = action.payload;

  const index = state.getIn(['data', `${workItemId}`, 'comment']).findIndex(item => item.get('id') === id);
  const currentCommentList = state.getIn(['data', `${workItemId}`, 'comment']);
  let commentList = currentCommentList.setIn([`${index}`, 'comment'], comment);
  commentList = commentList.mergeIn([`${index}`, 'files'], files);

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${workItemId}`, 'comment'], commentList)
  );
};

const updateCustomFieldValue = (state, action) => {
  const {
    fieldId,
    fieldValue,
    workItemId,
  } = action.payload;
  const workItemFromStore = state.getIn(['data', `${workItemId}`]);

  if (workItemFromStore) {
    return state.withMutations(
      (nextState) =>
        nextState
          .setIn(['data', `${workItemId}`, `${fieldId}`], fieldValue)
    );
  }

  return state;
};

function workItem(state = INITIAL_STATE, action) {
  switch (action.type) {
    case GET_WORKITEM_REQUEST:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', true)
      );
    case GET_WORKITEM_RECEIVE_SUCCESS:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', false)
            .setIn(['data', `${action.payload.workItemId}`], fromJS(action.payload.data))
      );
    case WORKITEM_ADD_COMMENT_RECEIVE_SUCCESS:
      return addComment(state, action);
    case WORKITEM_REMOVE_COMMENT_RECEIVE_SUCCESS:
      return removeComment(state, action);
    case WORKITEM_UPDATE_COMMENT_RECEIVE_SUCCESS:
      return updateComment(state, action);
    case WORKITEM_REMOVE_FILE_FROM_ITEM_RECEIVE_SUCCESS:
      return removeFileFromItem(state, action);
    case WORKITEM_REMOVE_FILE_FROM_COMMENT_RECEIVE_SUCCESS:
      return removeFileFromComment(state, action);
    case GET_WORKITEM_RECEIVE_ERROR:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', false)
      );
    case UPDATE_CUSTOM_FIELD_SUCCESS:
      return updateCustomFieldValue(state, action);
    case UPLOAD_FILE_ON_ITEM:
      return uploadFileOnItem(state, action);
    case INVALIDATE_WORKITEM:
      return INITIAL_STATE;
    default:
      return state;
  }
}

export default workItem;
