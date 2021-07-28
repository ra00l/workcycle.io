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

import nestsService from './nests.service';

const privateService = {};

privateService.createNest = (boardId, nest) => (dispatch, getState) => {
  dispatch({type: CREATE_NEST_REQUEST});

  // call api
  nestsService.createNest(boardId, nest)
    .then(response => {
      dispatch({
        type: CREATE_NEST_REQUEST_SUCCESS,
        payload: {
          nestId: response.id,
          nest: {
            ...nest,
            id: response.id,
            sortedWorkItems: [],
          },
        },
      });
    }, err => {
      dispatch({
        type: CREATE_NEST_REQUEST_FAILURE,
        meta: {
          notification: {
            message: 'NESTS.NEST.MESSAGES.CREATE_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.updateNest = (boardId, nestId, newUpdatedNest) => (dispatch, getState) => {
  dispatch({type: UPDATE_NEST_REQUEST});

  // call api
  nestsService.updateNest(boardId, nestId, newUpdatedNest)
    .then(response => {
      dispatch({
        type: UPDATE_NEST_REQUEST_SUCCESS,
        payload: {
          nestId,
          data: newUpdatedNest,
        },
      });
    }, err => {
      dispatch({
        type: UPDATE_NEST_REQUEST_FAILURE,
        meta: {
          notification: {
            message: 'NESTS.NEST.MESSAGES.UPDATE_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.moveNestToAnotherBoard = (boardId, nestId, newUpdatedNest) => (dispatch, getState) => {
  dispatch({type: MOVE_NEST_REQUEST});

  // call api
  nestsService.updateNest(boardId, nestId, newUpdatedNest)
    .then(response => {
      dispatch({
        type: MOVE_NEST_REQUEST_SUCCESS,
        meta: {
          notification: {
            message: 'NESTS.NEST.MESSAGES.MOVE_WITH_SUCCESS',
          },
        },
        payload: {
          nestId,
        },
      });
    }, err => {
      dispatch({
        type: MOVE_NEST_REQUEST_FAILURE,
        meta: {
          notification: {
            message: 'NESTS.NEST.MESSAGES.UPDATE_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.orderNest = (boardId, nestId, nestOrder, nestPosition) => (dispatch, getState) => {
  dispatch({type: ORDER_NEST_REQUEST});

  // call api
  nestsService.updateNest(boardId, nestId, nestOrder)
    .then(response => {
      dispatch({
        type: ORDER_NEST_REQUEST_SUCCESS,
        payload: {
          nestId,
          nestPosition,
        },
      });
    }, err => {
      dispatch({
        type: ORDER_NEST_REQUEST_FAILURE,
        meta: {
          notification: {
            message: 'NESTS.NEST.MESSAGES.UPDATE_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.removeNest = (boardId, nestId) => (dispatch, getState) => {
  dispatch({type: REMOVE_NEST_REQUEST});

  // call api
  nestsService.removeNest(boardId, nestId)
    .then(response => {
      dispatch({
        type: REMOVE_NEST_REQUEST_SUCCESS,
        payload: {
          nestId,
        },
      });
    }, err => {
      dispatch({
        type: REMOVE_NEST_REQUEST_FAILURE,
        meta: {
          notification: {
            message: 'NESTS.NEST.MESSAGES.REMOVE_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

// -----------------------------------------------------------------------
// End private are
// -----------------------------------------------------------------------

// set nests in the store
const setNests = (nestsObject = {}) =>
  (dispatch, getState) => dispatch({
    type: SET_NESTS,
    payload: {
      data: nestsObject.nests,
      sorted: nestsObject.sorted,
    },
  });

const addWorkItemToNest = (nestId, workItemId, workItemPosition = null) => (dispatch, getState) => dispatch({
  type: ADD_WORKITEM_TO_NEST,
  payload: {
    nestId,
    workItemId,
    workItemPosition,
  },
});

const removeWorkItemFromNest = (nestId, workItemId) => (dispatch, getState) => dispatch({
  type: REMOVE_WORKITEM_FROM_NEST,
  payload: {
    nestId,
    workItemId,
  },
});

const orderWorkItemInDifferentNests = (workItemId, fromNestId, toNestId, itemPosition) =>
  (dispatch, getState) => dispatch({
    type: ORDER_WORKITEM_IN_DIFFERENT_NESTS,
    payload: {
      workItemId,
      fromNestId,
      toNestId,
      itemPosition,
    },
  });

const orderWorkItemInNest = (workItemId, nestId, itemPosition) =>
  (dispatch, getState) => dispatch({
    type: ORDER_WORKITEM_IN_NEST,
    payload: {
      workItemId,
      nestId,
      itemPosition,
    },
  });

const createNest = (boardId, nest) => (dispatch, getState) =>
  dispatch(privateService.createNest(boardId, nest));

const addNest = (nestId, nest) => (dispatch, getState) => dispatch({
  type: ADD_NEST,
  payload: {
    nest,
    nestId,
  },
});

const updateNest = (boardId, nestId, newUpdatedNest) => (dispatch, getState) =>
  dispatch(privateService.updateNest(boardId, nestId, newUpdatedNest));

const removeNest = (boardId, nestId) => (dispatch, getState) =>
  dispatch(privateService.removeNest(boardId, nestId));

const moveNestToAnotherBoard = (boardId, nestId, newNest) => (dispatch, getState) =>
  dispatch(privateService.moveNestToAnotherBoard(boardId, nestId, newNest));

const orderNest = (boardId, nestId, nestOrder, nestPosition) => (dispatch, getState) =>
  dispatch(privateService.orderNest(boardId, nestId, nestOrder, nestPosition));

export {
  setNests,
  createNest,
  updateNest,
  removeNest,
  moveNestToAnotherBoard,
  addNest,
  orderNest,
  addWorkItemToNest,
  removeWorkItemFromNest,
  orderWorkItemInNest,
  orderWorkItemInDifferentNests,
};
