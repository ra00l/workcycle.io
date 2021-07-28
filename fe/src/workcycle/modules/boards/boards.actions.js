/**
 * @namespace boards
 */

/**
 * @namespace boards.actions
 */

import keyBy from 'lodash.keyby';
import orderBy from 'lodash.orderby';

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
  SAVE_BOARD_TEMPLATE_ERROR,
  SAVE_BOARD_TEMPLATE_SUCCESS,
  MOVE_BOARD,
} from './boards.constants';

import {setFolders, moveBoardToFolder} from './../folders/folders.actions';
import {addGoal} from './../goals/goals.actions';

// services
import boardsService from './boards.service';

const privateService = {};

// Private area
// -------------

privateService.getFolders = (dataFolders, dataBoards) => {
  const sortedFolders = [];
  const sortedBoards = [];

  const orderByFolder = orderBy(dataFolders, 'order', 'asc');

  orderByFolder.map(folder => {
    if (!folder.idParent) {
      sortedFolders.push(folder.id);
    }
  });

  dataBoards.map(board => {
    if (!board.idFolder) {
      sortedBoards.push(board.id);
    }
  });

  const folders = {};

  dataFolders.forEach(folder => {
    const subFolders = [];
    const boards = [];
    folders[folder.id] = folder;

    // add child folders
    orderBy(dataFolders, 'order', 'asc').forEach(item => {
      if (item.idParent && folder.id === item.idParent) {
        subFolders.push(item.id);
      }
    });

    // add child boards
    orderBy(dataBoards, 'order', 'asc').forEach(item => {
      if (item.idFolder && folder.id === item.idFolder) {
        boards.push(item.id);
      }
    });

    folders[folder.id].subFolders = subFolders;
    folders[folder.id].boards = boards;
  });

  return {
    data: folders,
    sortedFolders: sortedFolders,
    sortedBoards: sortedBoards,
  };
};

privateService.receive = (data) => {
  const sortedBoards = [];
  const boards = keyBy(data, 'id');

  const orderByBoard = orderBy(data, 'order', 'asc');

  orderByBoard.map(board => {
    if (!board.idFolder) {
      sortedBoards.push(board.id);
    }
  });

  return {
    payload: {
      data: boards,
      sorted: sortedBoards,
    },
    type: RECEIVED_BOARDS,
  };
};

privateService.receiveError = (errorData) => ({
  payload: {
    error: errorData,
  },
  type: RECEIVED_BOARDS_ERROR,
});

privateService.getBoards = (workspaceId) => (dispatch, getState) => {
  // request board
  dispatch({
    type: REQUEST_BOARDS,
  });

  // call api
  boardsService.getBoards(workspaceId)
    .then(response => {
      dispatch(setFolders(privateService.getFolders(response.folderList, response.boardList)));
      dispatch(privateService.receive(response.boardList));
    }, err => {
      dispatch(privateService.receiveError(err));
    });
};

privateService.shouldGet = (state) => {
  const entityFromStore = state.boards;

  // there is an action in progress or we have data in the store
  if (entityFromStore.actionInProgress || entityFromStore.data) {
    return false;
  }

  return true;
};

privateService.cloneBoard = (workspaceId, boardId, isGoal, folderId, boardName) => (dispatch, getState) => {
  dispatch({
    type: CLONE_BOARD,
  });

  boardsService.cloneBoard(workspaceId, boardId, isGoal, folderId, boardName)
    .then(response => {
      if (!isGoal) {
        dispatch({
          type: CLONE_BOARD_SUCCESS,
          payload: {
            boardId: response.id,
            data: response,
          },
        });
      }
      
      // set the board to a specific folder
      if (response.idFolder) {
        dispatch(moveBoardToFolder(response.id, response.idFolder, null));
      }

      if (isGoal) {
        // add goal
        dispatch(addGoal(response));
      }
    })
    .catch(err => {
      dispatch({
        type: CLONE_BOARD_ERROR,
        meta: {
          notification: {
            message: 'BOARDS.BOARD.MESSAGES.CLONE_ITEM_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

privateService.saveBoardAsTemplate = (workspaceId, boardId) => (dispatch, getState) => {
  dispatch({
    type: SAVE_BOARD_TEMPLATE,
  });

  boardsService.saveBoardAsTemplate(workspaceId, boardId)
    .then(response => {
      dispatch({
        type: SAVE_BOARD_TEMPLATE_SUCCESS,
        payload: {
          boardId: response.id,
          data: response,
        },
      });
    })
    .catch(err => {
      dispatch({
        type: SAVE_BOARD_TEMPLATE_ERROR,
        meta: {
          notification: {
            message: 'BOARDS.BOARD.MESSAGES.SAVE_BOARD_TEMPLATE_WITH_FAILURE',
          },
        },
        error: true,
      });
    });
};

// End private area
// -----------------
const getBoards = (workspaceId) => (dispatch, getState) => {
  if (privateService.shouldGet(getState())) {
    return dispatch(privateService.getBoards(workspaceId));
  }
};

const addBoard = (board) => (dispatch, getState) => {
  const payload = {
    data: board,
  };

  return dispatch({
    type: ADD_BOARD,
    payload,
  });
};

const cloneBoard = (workspaceId, boardId, isGoal, folderId, boardName) => (dispatch, getState) =>
  dispatch(privateService.cloneBoard(workspaceId, boardId, isGoal, folderId, boardName));

const saveBoardAsTemplate = (workspaceId, boardId) => (dispatch, getState) =>
  dispatch(privateService.saveBoardAsTemplate(workspaceId, boardId));

const removeBoard = (boardId, folderId) => (dispatch, getState) =>
  dispatch({
    type: REMOVE_BOARD,
    payload: {
      boardId,
      folderId,
    },
  });

const updateBoard = (boardId, board) => (dispatch, getState) =>
  dispatch({
    type: UPDATED_BOARD,
    payload: {
      boardId,
      data: board,
    },
  });

const moveBoard = (boardId, toFolder, fromFolder) => (dispatch, getState) =>
  dispatch({
    type: MOVE_BOARD,
    payload: {
      boardId,
      toFolder,
      fromFolder,
    },
  });

export {
  getBoards,
  addBoard,
  cloneBoard,
  removeBoard,
  updateBoard,
  saveBoardAsTemplate,
  moveBoard,
};
