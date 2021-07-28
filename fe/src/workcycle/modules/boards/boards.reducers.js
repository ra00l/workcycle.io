import {fromJS, Map} from 'immutable';

// constants
import {
  ADD_BOARD,
  REMOVE_BOARD,
  CLONE_BOARD,
  CLONE_BOARD_SUCCESS,
  CLONE_BOARD_ERROR,
  REQUEST_BOARDS,
  RECEIVED_BOARDS,
  RECEIVED_BOARDS_ERROR,
  UPDATED_BOARD,
  SAVE_BOARD_TEMPLATE,
  SAVE_BOARD_TEMPLATE_SUCCESS,
  SAVE_BOARD_TEMPLATE_ERROR,
  MOVE_BOARD,
} from './boards.constants';

import {
  ADD_GOAL,
  RECEIVED_GOALS,
} from './../goals/goals.constants';

const INITIAL_STATE = fromJS({
  actionInProgress: false,
  data: {},
  sorted: [],
  error: null,
});

const emptyImmutableList = fromJS([]);

const cloneBoard = (state, action) => {
  const {
    boardId,
    data,
  } = action.payload;

  if (!data.idFolder) {
    return state.withMutations(
      (nextState) =>
        nextState
          .updateIn(['sorted'], arr => arr.push(boardId))
          .mergeIn(['data', `${boardId}`], Map(data))
    );
  }

  return state.withMutations(
    (nextState) =>
      nextState
        .mergeIn(['data', `${boardId}`], Map(data))
  );
};

const moveBoard = (state, action) => {
  const {
    boardId,
    toFolder,
    fromFolder,
  } = action.payload;

  if (toFolder) {
    if (fromFolder) {
      // const index = state.get('sorted').findIndex(id => id === boardId);
      // const sorted = state.get('sorted').delete(index);
    
      return state.withMutations((newState) =>
        newState
          // .set('sorted', sorted)
          .setIn(['data', `${boardId}`, 'idFolder'], toFolder)
      );
    }

    const index = state.get('sorted').findIndex(id => id === boardId);
    const sorted = state.get('sorted').delete(index);
  
    return state.withMutations((newState) =>
      newState
        .set('sorted', sorted)
        .setIn(['data', `${boardId}`, 'idFolder'], toFolder)
    );
  }

  return state.withMutations((newState) =>
    newState
      .updateIn(['sorted'], arr => arr.push(boardId))
      .setIn(['data', `${boardId}`, 'idFolder'], toFolder)
  );
};

const removeBoard = (state, action) => {
  const index = state.get('sorted').findIndex(id => id === action.payload.boardId);
  let sorted = [];

  if (index !== -1) {
    sorted = state.get('sorted').delete(index);
  } else {
    sorted = state.get('sorted');
  }

  return state.withMutations((newState) =>
    newState
      .deleteIn(['data', action.payload.boardId])
      .set('sorted', sorted)
      .set('actionInProgress', false));
};

const boards = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ADD_BOARD:
      return state.withMutations(
        (nextState) =>
          nextState
            .updateIn(['sorted'], arr => arr.push(action.payload.data.id))
            .mergeIn(['data', `${action.payload.data.id}`], Map(action.payload.data))
      );
    case UPDATED_BOARD:
      return state.withMutations(
        (nextState) =>
          nextState
            .mergeIn(['data', `${action.payload.boardId}`], Map(action.payload.data))
      );
    case REQUEST_BOARDS:
    case CLONE_BOARD:
      return state.set('actionInProgress', true);
    case RECEIVED_BOARDS:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', false)
            .merge(fromJS(action.payload))
      );
    case RECEIVED_GOALS:
      return state.withMutations(
        (nextState) =>
          nextState
            .mergeIn(['data'], fromJS(action.payload.data))
      );
    case ADD_GOAL:
      return state.withMutations(
        (nextState) =>
          nextState
            .mergeIn(['data', `${action.payload.data.id}`], Map(action.payload.data))
      );
    case RECEIVED_BOARDS_ERROR:
      return INITIAL_STATE.withMutations((newState) =>
        newState
          .set('data', emptyImmutableList)
          .set('sorted', emptyImmutableList)
        );
    case REMOVE_BOARD:
      return removeBoard(state, action);
    case CLONE_BOARD_SUCCESS:
      return cloneBoard(state, action);
    case SAVE_BOARD_TEMPLATE:
      return state.set('actionInProgress', true);
    case SAVE_BOARD_TEMPLATE_SUCCESS:
      return state.set('actionInProgress', false);
    case SAVE_BOARD_TEMPLATE_ERROR:
      return state.set('actionInProgress', false);
    case MOVE_BOARD:
      return moveBoard(state, action);
    default:
      return state;
  }
};

export default boards;
