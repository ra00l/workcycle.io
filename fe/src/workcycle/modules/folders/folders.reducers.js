import {fromJS} from 'immutable';

import {
  SET_FOLDERS,
  DELETE_FOLDER,
  ADD_FOLDER,
  MOVE_FOLDER,
  MOVE_BOARD_TO_FOLDER,
  RENAME_FOLDER,
} from './folders.constants';

import {REMOVE_BOARD} from './../boards/boards.constants';

const INITIAL_STATE = fromJS({
  data: null,
  sortedFolders: null,
  sortedBoards: null,
  actionInProgress: false,
});

const moveBoardToFolder = (state, action) => {
  const {
    boardId,
    toFolder,
    fromFolder,
  } = action.payload;

  if (toFolder) {
    // move to some subfolder
    if (fromFolder) {
      const index = state.getIn(['data', `${fromFolder}`, 'boards']).findIndex(id => id === boardId);
      const currentSubfolders = state.getIn(['data', `${fromFolder}`, 'boards']).delete(index);
      const subFolders = currentSubfolders;

      return state.withMutations((newState) =>
        newState
          .updateIn(['data', `${toFolder}`, 'boards'], arr => arr.push(boardId))
          .setIn(['data', `${fromFolder}`, 'boards'], subFolders)
        );
    }

    // move from root
    const index = state.get('sortedBoards').findIndex(id => id === boardId);
    const currentSubfolders = state.get('sortedBoards').delete(index);
    const subFolders = currentSubfolders;

    return state.withMutations((newState) =>
      newState
        .updateIn(['data', `${toFolder}`, 'boards'], arr => arr.push(boardId))
        .set('sortedBoards', subFolders)
      );
  }

  // move to root folder
  const index = state.getIn(['data', `${fromFolder}`, 'boards']).findIndex(id => id === boardId);
  const currentSubfolders = state.getIn(['data', `${fromFolder}`, 'boards']).delete(index);
  const subFolders = currentSubfolders;

  return state.withMutations((newState) =>
    newState
      .updateIn(['sortedBoards'], arr => arr.push(boardId))
      .setIn(['data', `${fromFolder}`, 'boards'], subFolders)
    );
};

const moveFolder = (state, action) => {
  const {
    folderId,
    toFolder,
    fromFolder,
  } = action.payload;

  if (toFolder) {
    // move to some subfolder
    if (fromFolder) {
      const index = state.getIn(['data', `${fromFolder}`, 'subFolders']).findIndex(id => id === folderId);
      const currentSubfolders = state.getIn(['data', `${fromFolder}`, 'subFolders']).delete(index);
      const subFolders = currentSubfolders;

      return state.withMutations((newState) =>
        newState
          .updateIn(['data', `${toFolder}`, 'subFolders'], arr => arr.push(folderId))
          .setIn(['data', `${folderId}`, 'idParent'], toFolder)
          .setIn(['data', `${fromFolder}`, 'subFolders'], subFolders)
        );
    }

    // move from root
    const index = state.get('sortedFolders').findIndex(id => id === folderId);
    const currentSubfolders = state.get('sortedFolders').delete(index);
    const subFolders = currentSubfolders;

    return state.withMutations((newState) =>
      newState
        .updateIn(['data', `${toFolder}`, 'subFolders'], arr => arr.push(folderId))
        .setIn(['data', `${folderId}`, 'idParent'], toFolder)
        .set('sortedFolders', subFolders)
      );
  }
  
  // move to root folder
  const index = state.getIn(['data', `${fromFolder}`, 'subFolders']).findIndex(id => id === folderId);
  const currentSubfolders = state.getIn(['data', `${fromFolder}`, 'subFolders']).delete(index);
  const subFolders = currentSubfolders;

  return state.withMutations((newState) =>
    newState
      .updateIn(['sortedFolders'], arr => arr.push(folderId))
      .setIn(['data', `${folderId}`, 'idParent'], toFolder)
      .setIn(['data', `${fromFolder}`, 'subFolders'], subFolders)
    );
};

const deleteFolder = (state, action) => {
  const {
    folderId,
    parentId,
  } = action.payload;

  // remove from the parent.subFolders array
  if (parentId) {
    const index = state.getIn(['data', `${parentId}`, 'subFolders']).findIndex(id => id === folderId);
    const currentSubfolders = state.getIn(['data', `${parentId}`, 'subFolders']).delete(index);
    const subFolders = currentSubfolders;
  
    return state.withMutations((newState) =>
      newState
        .deleteIn(['data', `${folderId}`])
        .setIn(['data', `${parentId}`, 'subFolders'], subFolders)
    );
  }

  const index = state.get('sortedFolders').findIndex(id => id === folderId);
  const sortedFolders = state.get('sortedFolders').delete(index);

  return state.withMutations((newState) =>
    newState
      .deleteIn(['data', `${folderId}`])
      .set('sortedFolders', sortedFolders)

  );
};

const renameFolder = (state, action) => {
  const {
    folderId,
    name,
  } = action.payload;

  return state.withMutations((newState) =>
    newState
      .setIn(['data', `${folderId}`, 'name'], name)

  );
};

const removeBoardFromFolder = (state, action) => {
  const {
    boardId,
    folderId,
  } = action.payload;

  if (folderId) {
    const index = state.getIn(['data', `${folderId}`, 'boards']).findIndex(id => id === boardId);
    const currentSubfolders = state.getIn(['data', `${folderId}`, 'boards']).delete(index);
    const subFolders = currentSubfolders;

    return state.withMutations((newState) =>
      newState
        .setIn(['data', `${folderId}`, 'boards'], subFolders)
      );
  }

  return state;
};

const addFolder = (state, action) => {
  const {
    payload: {
      folder,
    },
  } = action;

  // create under a specific folder
  if (folder.idParent) {
    // specific folder
    return state.withMutations(
      (nextState) =>
        nextState
          .updateIn(['data', `${folder.idParent}`, 'subFolders'], arr => arr.push(folder.id))
          .mergeIn(['data', `${action.payload.folder.id}`], fromJS({
            ...action.payload.folder,
            boards: [],
            subFolders: [],
          }))
    );
  }

  // root folder
  return state.withMutations(
    (nextState) =>
      nextState
        .updateIn(['sortedFolders'], arr => arr.push(action.payload.folder.id))
        .mergeIn(['data', `${action.payload.folder.id}`], fromJS({
          ...action.payload.folder,
          boards: [],
          subFolders: [],
        }))
  );
};

function folder(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_FOLDERS:
      return state.withMutations((newState) =>
        newState
          .merge(fromJS(action.payload))
      );
    case DELETE_FOLDER:
      return deleteFolder(state, action);
    case MOVE_FOLDER:
      return moveFolder(state, action);
    case MOVE_BOARD_TO_FOLDER:
      return moveBoardToFolder(state, action);
    case RENAME_FOLDER:
      return renameFolder(state, action);
    case REMOVE_BOARD:
      return removeBoardFromFolder(state, action);
    case ADD_FOLDER:
      return addFolder(state, action);
    default:
      return state;
  }
}

export default folder;
