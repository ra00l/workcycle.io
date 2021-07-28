import {
  INVALIDATE_WORKITEM,
  GET_WORKITEM_REQUEST,
  GET_WORKITEM_RECEIVE_SUCCESS,
  GET_WORKITEM_RECEIVE_ERROR,
  WORKITEM_ADD_COMMENT_REQUEST,
  WORKITEM_ADD_COMMENT_RECEIVE_SUCCESS,
  WORKITEM_ADD_COMMENT_RECEIVE_ERROR,
  WORKITEM_REMOVE_COMMENT_REQUEST,
  WORKITEM_REMOVE_COMMENT_RECEIVE_SUCCESS,
  WORKITEM_REMOVE_COMMENT_RECEIVE_ERROR,
  WORKITEM_UPDATE_COMMENT_REQUEST,
  WORKITEM_UPDATE_COMMENT_RECEIVE_SUCCESS,
  WORKITEM_UPDATE_COMMENT_RECEIVE_ERROR,
  UPLOAD_FILE_ON_ITEM,
  WORKITEM_REMOVE_FILE_FROM_ITEM_REQUEST,
  WORKITEM_REMOVE_FILE_FROM_ITEM_RECEIVE_SUCCESS,
  WORKITEM_REMOVE_FILE_FROM_ITEM_RECEIVE_ERROR,
  WORKITEM_REMOVE_FILE_FROM_COMMENT_REQUEST,
  WORKITEM_REMOVE_FILE_FROM_COMMENT_RECEIVE_SUCCESS,
  WORKITEM_REMOVE_FILE_FROM_COMMENT_RECEIVE_ERROR,
} from './workItem.constants';

import workItemService from './workItem/workItem.service';
import moment from 'moment';

const privateService = {};

const addComment = (boardId, workItemId, comment, userId, successCallback) => (dispatch, getState) => {
  dispatch({
    type: WORKITEM_ADD_COMMENT_REQUEST,
  });

  // // call api
  return workItemService.addComment(boardId, workItemId, comment)
    .then(response => {
      dispatch({
        type: WORKITEM_ADD_COMMENT_RECEIVE_SUCCESS,
        payload: {
          data: {
            id: response.id,
            comment: comment.get('comment'),
            createdBy: userId,
            createdAt: moment().format(),
            files: response.files,
          },
          workItemId,
        },
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.ADD_COMMENT_WITH_SUCCESS',
          },
        },
        success: true,
      });

      successCallback();
    }, err => {
      dispatch({
        type: WORKITEM_ADD_COMMENT_RECEIVE_ERROR,
        meta: {
          notification: {
            message: err.error || 'WORKITEMS.WORKITEM.MESSAGES.ADD_COMMENT_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

const removeComment = (boardId, workItemId, commentId) => (dispatch, getState) => {
  dispatch({
    type: WORKITEM_REMOVE_COMMENT_REQUEST,
  });

  // // call api
  workItemService.removeComment(boardId, workItemId, commentId)
    .then(response => {
      dispatch({
        type: WORKITEM_REMOVE_COMMENT_RECEIVE_SUCCESS,
        payload: {
          data: {
            id: commentId,
          },
          workItemId,
        },
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REMOVE_COMMENT_WITH_SUCCESS',
          },
        },
        success: true,
      });
    }, err => {
      dispatch({
        type: WORKITEM_REMOVE_COMMENT_RECEIVE_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REMOVE_COMMENT_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

const updateComment = (boardId, workItemId, commentId, comment) => (dispatch, getState) => {
  dispatch({
    type: WORKITEM_UPDATE_COMMENT_REQUEST,
  });

  // // call api
  workItemService.updateComment(boardId, workItemId, commentId, comment)
    .then(response => {
      dispatch({
        type: WORKITEM_UPDATE_COMMENT_RECEIVE_SUCCESS,
        payload: {
          data: {
            id: commentId,
            comment: comment.get('comment'),
            files: response.files,
          },
          workItemId,
        },
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.UPDATE_COMMENT_WITH_SUCCESS',
          },
        },
        success: true,
      });
    }, err => {
      console.error(err); // eslint-disable-line no-console

      dispatch({
        type: WORKITEM_UPDATE_COMMENT_RECEIVE_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.UPDATE_COMMENT_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

const getWorkItem = (boardId, workItemId) => (dispatch, getState) => {
  dispatch({
    type: GET_WORKITEM_REQUEST,
  });

  // // call api
  workItemService.getWorkItem(boardId, workItemId)
    .then(response => {
      dispatch({
        type: GET_WORKITEM_RECEIVE_SUCCESS,
        payload: {
          workItemId,
          data: response,
        },
      });
    }, err => {
      dispatch({
        type: GET_WORKITEM_RECEIVE_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.GET_WORKITEM_ERROR',
          },
        },
        error: true,
      });
    });
};

const invalidateWorkItem = () => dispatch => dispatch({
  type: INVALIDATE_WORKITEM,
});

const addFileToTheItem = (workItemId, file) => dispatch => dispatch({
  type: UPLOAD_FILE_ON_ITEM,
  payload: {
    file,
    workItemId,
  },
});

const deleteFileFromItem = (boardId, workItemId, fileId) => (dispatch, getState) => {
  dispatch({
    type: WORKITEM_REMOVE_FILE_FROM_ITEM_REQUEST,
  });

  // // call api
  workItemService.removeFileFromItem(boardId, workItemId, fileId)
    .then(response => {
      dispatch({
        type: WORKITEM_REMOVE_FILE_FROM_ITEM_RECEIVE_SUCCESS,
        payload: {
          data: {
            id: fileId,
          },
          workItemId,
        },
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REMOVE_FILE_WITH_SUCCESS',
          },
        },
        success: true,
      });
    }, err => {
      dispatch({
        type: WORKITEM_REMOVE_FILE_FROM_ITEM_RECEIVE_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REMOVE_FILE_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

const removeFileFromComment = (boardId, workItemId, commentId, fileId) => (dispatch, getState) => {
  dispatch({
    type: WORKITEM_REMOVE_FILE_FROM_COMMENT_REQUEST,
  });

  // // call api
  workItemService.removeFileFromItem(boardId, workItemId, fileId)
    .then(response => {
      dispatch({
        type: WORKITEM_REMOVE_FILE_FROM_COMMENT_RECEIVE_SUCCESS,
        payload: {
          data: {
            id: fileId,
            commentId,
          },
          workItemId,
        },
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REMOVE_FILE_WITH_SUCCESS',
          },
        },
        success: true,
      });

      // remove file from the item list (files tab)
      dispatch({
        type: WORKITEM_REMOVE_FILE_FROM_ITEM_RECEIVE_SUCCESS,
        payload: {
          data: {
            id: fileId,
          },
          workItemId,
        },
      });
    }, err => {
      dispatch({
        type: WORKITEM_REMOVE_FILE_FROM_COMMENT_RECEIVE_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REMOVE_FILE_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};


export {
  getWorkItem,
  invalidateWorkItem,
  addComment,
  removeComment,
  updateComment,
  addFileToTheItem,
  deleteFileFromItem,
  removeFileFromComment,
};
