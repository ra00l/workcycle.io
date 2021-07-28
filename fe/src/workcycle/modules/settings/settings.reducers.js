/**
 * @namespace boards.reducers
 */

// constants
import {
  ADD_BOARD,
  REMOVE_BOARD,
  REQUEST_BOARDS,
  RECEIVED_BOARDS,
  RECEIVED_BOARDS_ERROR,
} from './boards.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf boards.reducers
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[boards.reducers]';

/**
 * Reducer INITIAL_STATE
 *
 * @private
 * @memberOf boards.reducers
 * @const {Object}
 * @default
 */
const INITIAL_STATE = {
  actionInProgress: false,
  data: null,
  sorted: [],
  error: null,
  timestamp: Date.now(),
};

const addBoard = (state, action) => {
  const newState = Object.assign({}, state);
  const board = action.payload.data;

  // add in the sorted list
  newState.sorted.push(board.id);

  // add board information
  newState.data[board.id] = board;

  return newState;
};

const removeBoard = (state, action) => {
  const newState = Object.assign({}, state);
  const boardId = parseFloat(action.payload.boardId);

  // remove the board information
  delete newState.data[boardId];

  // remove from the sorted list
  const items = newState.sorted;
  const index = items.indexOf(boardId);

  if (index !== -1) {
    items.splice(index, 1);
  }

  newState.sorted = items;

  return newState;
};

/**
 * Reducer for boards. Listens to all actions and prepares reduced objects for state.
 * @memberOf boards.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function boards(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD_BOARD:
      return addBoard(state, action);
    case REQUEST_BOARDS:
      return Object.assign({}, state, {
        actionInProgress: true,
        data: null,
        error: null,
        timestamp: Date.now(),
      });
    case RECEIVED_BOARDS:
      return Object.assign({}, state, {
        actionInProgress: false,
        data: action.payload.data,
        sorted: action.payload.sorted,
        error: null,
        timestamp: Date.now(),
      });
    case RECEIVED_BOARDS_ERROR:
      return Object.assign({}, state, {
        actionInProgress: false,
        data: null,
        error: action.payload.error,
        timestamp: Date.now(),
      });
    case REMOVE_BOARD:
      return removeBoard(state, action);
    default:
      return state;
  }
}

export default boards;
