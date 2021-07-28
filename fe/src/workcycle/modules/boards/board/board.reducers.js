import {
  REQUEST_BOARD,
  RECEIVED_BOARD,
  RECEIVED_BOARD_ERROR,
  INVALIDATE_BOARD,
} from './board.constants';

const INITIAL_STATE = {
  actionInProgress: false,
  boardId: null,
  data: null,
  fields: null,
  nests: null,
  users: null,
  error: null,
};

const board = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case REQUEST_BOARD:
      return Object.assign({}, state, {
        actionInProgress: true,
        boardId: parseFloat(action.payload.boardId),
        data: null,
      });
    case RECEIVED_BOARD:
      return Object.assign({}, state, {
        actionInProgress: false,
        boardId: parseFloat(action.payload.boardId),
        fields: action.payload.fields,
        nests: action.payload.nests,
        users: action.payload.users,
      });
    case RECEIVED_BOARD_ERROR:
      return Object.assign({}, state, {
        actionInProgress: false,
        boardId: null,
        data: null,
        error: action.payload.error,
      });
    case INVALIDATE_BOARD:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default board;
