import {
  SET_FOLDERS,
  DELETE_FOLDER,
  ADD_FOLDER,
  MOVE_FOLDER,
  MOVE_BOARD_TO_FOLDER,
  RENAME_FOLDER,
} from './folders.constants';

const setFolders = (items) => (dispatch, getState) =>
  dispatch({
    type: SET_FOLDERS,
    payload: {
      data: items.data,
      sortedFolders: items.sortedFolders,
      sortedBoards: items.sortedBoards,
    },
  });

const removeFolder = (folderId, parentId) => (dispatch, getState) =>
  dispatch({
    type: DELETE_FOLDER,
    payload: {
      folderId,
      parentId,
    },
  });

const renameFolder = (folderId, name) => (dispatch, getState) =>
dispatch({
  type: RENAME_FOLDER,
  payload: {
    folderId,
    name,
  },
});

const addFolder = (folder) => (dispatch, getState) =>
  dispatch({
    type: ADD_FOLDER,
    payload: {
      folder,
    },
  });

const moveBoardToFolder = (boardId, toFolder, fromFolder) => (dispatch, getState) =>
  dispatch({
    type: MOVE_BOARD_TO_FOLDER,
    payload: {
      boardId,
      toFolder,
      fromFolder,
    },
  });

const moveFolder = (folderId, toFolder, fromFolder) => (dispatch, getState) =>
  dispatch({
    type: MOVE_FOLDER,
    payload: {
      folderId,
      toFolder,
      fromFolder,
    },
  });

export {
  setFolders,
  addFolder,
  removeFolder,
  renameFolder,
  moveFolder,
  moveBoardToFolder,
};
