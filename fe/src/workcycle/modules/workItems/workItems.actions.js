import workItemService from './workItem/workItem.service';
import workItemsService from './workItems.service';

import {
  ADD_CHILD_WORKITEM,
  REMOVE_CHILD_WORKITEM,
  ADD_WORKITEMS,
  DELETE_WORKITEM,
  DELETE_WORKITEM_SUCCESS,
  DELETE_WORKITEM_ERROR,
  UPDATE_WORKITEM,
  UPDATE_CUSTOM_FIELD_REQUEST,
  UPDATE_CUSTOM_FIELD_SUCCESS,
  UPDATE_CUSTOM_FIELD_ERROR,
  ORDER_WORKITEM,
  ORDER_WORKITEM_ERROR,
  ORDER_WORKITEM_SUCCESS,
  ORDER_CHILD_WORKITEM,
  ORDER_CHILD_WORKITEM_ERROR,
  ORDER_CHILD_WORKITEM_SUCCESS,
  CONVERT_TO_WORKITEM,
  CONVERT_TO_WORKITEM_SUCCESS,
  CONVERT_TO_WORKITEM_ERROR,
  CLONE_WORKITEM,
  CLONE_WORKITEM_SUCCESS,
  CLONE_WORKITEM_ERROR,
  ADD_CHILD_OF_WORKITEM,
  ADD_CHILD_OF_WORKITEM_SUCCESS,
  ADD_CHILD_OF_WORKITEM_ERROR,
  SET_DEPENDENCY_FIELD,
} from './workItems.constants';

import {
  addWorkItemToNest,
  removeWorkItemFromNest,
  orderWorkItemInNest,
  orderWorkItemInDifferentNests,
} from '../nests/nests.actions';
import {removeItemFromGoal} from './../goals/goals.actions';

const privateService = {};

privateService.updateWorkItemCustomField = (boardId, workItemId, fieldId, newFieldValue) => (dispatch, getState) => {
  dispatch({
    type: UPDATE_CUSTOM_FIELD_REQUEST,
  });

  // call api
  workItemService.updateWorkItemCustomField(boardId, workItemId, newFieldValue)
    .then(response => {
      // update field in workitem
      dispatch({
        type: UPDATE_CUSTOM_FIELD_SUCCESS,
        payload: {
          workItemId,
          fieldId,
          fieldValue: newFieldValue[fieldId],
        },
      });
    }, err => {
      dispatch({
        type: UPDATE_CUSTOM_FIELD_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.UPDATE_CUSTOM_FIELD_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.updateWorkItemCustomFieldDependency = (boardId, workItemId, workItem, fieldId, listOfDependencies) =>
  (dispatch, getState) => {
    // call api
    workItemService.updateWorkItemCustomField(boardId, workItemId, workItem)
      .then(response => {
        // update workItem in store
        dispatch({
          type: SET_DEPENDENCY_FIELD,
          payload: {
            workItemId,
            fieldId,
            newValue: listOfDependencies,
          },
        });
      }, err => {
        // TODO: on error do something
      });
  };

privateService.cloneWorkItem = (boardId, workItem, nestId) => (dispatch, getState) => {
  dispatch({
    type: CLONE_WORKITEM,
  });

  workItem.idNest = nestId || workItem.idNest;

  workItemService.createWorkItem(boardId, workItem)
    .then(response => {
      dispatch({
        type: CLONE_WORKITEM_SUCCESS,
        payload: {
          workItemId: response.id,
          workItem: {
            ...workItem,
            ...response,
          },
        },
      });

      if (!workItem.idParent) {
        // add in the nest at the end
        dispatch(addWorkItemToNest(workItem.idNest, response.id));
      }
    })
    .catch(err => {
      dispatch({
        type: CLONE_WORKITEM_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.CLONE_ITEM_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.deleteWorkItem = (workItemId, nestId, boardId, idParent, isGoal) => (dispatch, getState) => {
  dispatch({
    type: DELETE_WORKITEM,
  });

  // call api
  workItemsService.deleteWorkItem(workItemId, boardId)
    .then(response => {

      if (!idParent) {
        // remove from the sorteWorkItems list from nest
        dispatch(removeWorkItemFromNest(nestId, workItemId));
      } else {
        // remove child
        dispatch(removeChildWorkItem(idParent, workItemId));
      }

      // remove from work item store
      dispatch({
        type: DELETE_WORKITEM_SUCCESS,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.DELETE_ITEM_WITH_SUCCESS',
          },
        },
        payload: {
          workItemId,
          idParent,
        },
        success: true,
      });

      if (isGoal) {
        // remove from the goal as well
        dispatch(removeItemFromGoal(boardId, workItemId));
      }
    }, err => {
      dispatch({
        type: DELETE_WORKITEM_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.DELETE_ITEM_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.orderWorkItem = (boardId, workItemId, moveFromNest, toNest) => (dispatch, getState) => {
  dispatch({
    type: ORDER_WORKITEM,
  });

  const fromNestId = moveFromNest.droppableId;
  const toNestId = toNest.droppableId;
  const newOrderValue = toNest.index + 1;

  // call api
  workItemsService.orderWorkItem(boardId, workItemId, toNestId, newOrderValue)
    .then(response => {
      dispatch({
        type: ORDER_WORKITEM_SUCCESS,
      });

      if (fromNestId !== toNestId) {
        // we are changing the nest
        dispatch(orderWorkItemInDifferentNests(workItemId, fromNestId, toNestId, toNest.index));
      } else {
        // we are inside the same nest
        dispatch(orderWorkItemInNest(workItemId, toNestId, toNest.index));
      }
    }, err => {
      dispatch({
        type: ORDER_WORKITEM_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REORDER_ITEM_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.addChildOfItem = (boardId, workItemId, parentItem, previousParent) => (dispatch, getState) => {
  dispatch({
    type: ADD_CHILD_OF_WORKITEM,
  });

  // call api
  workItemsService.addChildOf(boardId, workItemId, parentItem)
    .then(response => {

      if (!previousParent.idParent) {
        // remove from nest
        dispatch(removeWorkItemFromNest(previousParent.idNest, workItemId));
      }

      dispatch({
        type: ADD_CHILD_OF_WORKITEM_SUCCESS,
        payload: {
          workItemId,
          parentId: parentItem.idParent,
          previousParentId: previousParent.idParent,
        },
      });
    }, err => {
      dispatch({
        type: ADD_CHILD_OF_WORKITEM_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REORDER_ITEM_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.convertToWorkItem = (boardId, nestId, workItemId, previousParentId, workItem) =>
  (dispatch, getState) => {
    dispatch({
      type: CONVERT_TO_WORKITEM,
    });

    workItemService.updateWorkItem(boardId, workItemId, workItem)
      .then(response => {
        dispatch({
          type: CONVERT_TO_WORKITEM_SUCCESS,
          payload: {
            nestId,
            previousParentId,
            workItemId,
          },
        });
      })
      .catch(error => {
        dispatch({
          type: CONVERT_TO_WORKITEM_ERROR,
          meta: {
            notification: {
              message: 'WORKITEMS.WORKITEM.MESSAGES.REORDER_ITEM_WITH_FAILURE',
            },
          },
          error: true,
        });
      });
  };


privateService.orderChildWorkItem = (boardId, childWorkItemId, fromItem, toItem) => (dispatch, getState) => {
  dispatch({
    type: ORDER_CHILD_WORKITEM,
  });

  const newChildItemPosition = toItem.index + 1;

  const workItem = {
    order: newChildItemPosition,
  };

  workItemService.updateWorkItem(boardId, childWorkItemId, workItem)
    .then(response => {
      dispatch({
        type: ORDER_CHILD_WORKITEM_SUCCESS,
        payload: {
          childWorkItemId: childWorkItemId,
          childWorkItemOrder: toItem.index,
          workItemId: toItem.droppableId,
        },
      });
    })
    .catch(error => {
      dispatch({
        type: ORDER_CHILD_WORKITEM_ERROR,
        meta: {
          notification: {
            message: 'WORKITEMS.WORKITEM.MESSAGES.REORDER_ITEM_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

// add workitems into the store
const addWorkItems = (workItems) => (dispatch, getState) =>
  dispatch({
    type: ADD_WORKITEMS,
    payload: {
      data: workItems,
    },
  });

const updateWorkItemCustomField = (boardId, workItemId, fieldId, newFieldValue) => (dispatch, getState) =>
  dispatch(privateService.updateWorkItemCustomField(boardId, workItemId, fieldId, newFieldValue));

const updateWorkItemCustomFieldDependencies = (boardId, workItemId, workItem, fieldId, listOfDependencies) =>
  (dispatch, getState) =>
  dispatch(
    privateService.updateWorkItemCustomFieldDependency(boardId, workItemId, workItem, fieldId, listOfDependencies)
  );

const deleteWorkItem = (workItemId, nestId, boardId, idParent, isGoal) => (dispatch, getState) =>
  dispatch(privateService.deleteWorkItem(workItemId, nestId, boardId, idParent, isGoal));

const updateWorkItem = (workItemId, workItem) => (dispatch, getState) =>
  dispatch({
    type: UPDATE_WORKITEM,
    payload: {
      workItemId,
      workItem,
    },
  });

const orderWorkItem = (boardId, workItemId, moveFromNest, toNest) => (dispatch, getState) =>
  dispatch(privateService.orderWorkItem(boardId, workItemId, moveFromNest, toNest));

const orderChildWorkItem = (boardId, childWorkItemId, fromItem, toItem) => (dispatch, getState) =>
  dispatch(privateService.orderChildWorkItem(boardId, childWorkItemId, fromItem, toItem));

const cloneWorkItem = (boardId, workItem, nestId) => (dispatch, getState) =>
  dispatch(privateService.cloneWorkItem(boardId, workItem, nestId));

const convertToWorkItem = (boardId, nestId, workItemId, previousParentId, workItem) => (dispatch, getState) =>
  dispatch(privateService.convertToWorkItem(boardId, nestId, workItemId, previousParentId, workItem));

const addChildWorkItem = (parentWorkItemId, childWorkItemId) => (dispatch, getState) =>
  dispatch({
    type: ADD_CHILD_WORKITEM,
    payload: {
      parentWorkItemId,
      childWorkItemId,
    },
  });

const addChildOfItem = (boardId, workItemId, parentItem, previousParent) => (dispatch, getState) =>
dispatch(privateService.addChildOfItem(boardId, workItemId, parentItem, previousParent));

const removeChildWorkItem = (parentWorkItemId, childWorkItemId) => (dispatch, getState) =>
  dispatch({
    type: REMOVE_CHILD_WORKITEM,
    payload: {
      parentWorkItemId,
      childWorkItemId,
    },
  });

export {
  addWorkItems,
  deleteWorkItem,
  updateWorkItem,
  orderWorkItem,
  orderChildWorkItem,
  convertToWorkItem,
  cloneWorkItem,
  addChildWorkItem,
  addChildOfItem,
  removeChildWorkItem,
  updateWorkItemCustomField,
  updateWorkItemCustomFieldDependencies,
};
