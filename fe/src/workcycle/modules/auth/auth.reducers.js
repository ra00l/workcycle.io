import {
  SET_USER_AUTHENTICATION_STATUS,
  INVALIDATE_AUTH,
  USER_INFO_REQUEST,
  USER_INFO_REQUEST_SUCCESS,
  USER_INFO_REQUEST_ERROR,
  UPDATE_IMAGE,
  UPDATE_THEME,
  UPDATE_NAME,
  UPDATE_EMAIL,
  DELTE_WORKSPACE,
} from './auth.constants';

/**
 * Reducer INITIAL_STATE
 *
 * @private
 * @memberOf auth.reducers
 * @const {Object}
 * @default
 */
const INITIAL_STATE = {
  loggedIn: false,
  userInfo: null,
  actionInProgress: false,
  error: null,
};

const updateImageForCurrentUser = (state, action) => {
  const {
    userId,
    image,
  } = action.payload;

  const userIdFromStore = state.userInfo.id;

  if (userIdFromStore === userId) {
    return Object.assign({}, state, {
      actionInProgress: false,
      userInfo: {
        ...state.userInfo,
        img: image,
      },
    });
  }

  return state;
};

const updateThemeForCurrentUser = (state, action) => {
  const {
    themeName,
  } = action.payload;

  return Object.assign({}, state, {
    actionInProgress: false,
    userInfo: {
      ...state.userInfo,
      theme: themeName,
    },
  });
};

const updateNameForCurrentUser = (state, action) => {
  const {
    name,
  } = action.payload;

  return Object.assign({}, state, {
    actionInProgress: false,
    userInfo: {
      ...state.userInfo,
      name,
    },
  });
};

const updateEmailForCurrentUser = (state, action) => {
  const {
    email,
  } = action.payload;

  return Object.assign({}, state, {
    actionInProgress: false,
    userInfo: {
      ...state.userInfo,
      email,
    },
  });
};

const deleteWorkspace = (state, action) => {
  const {workspaceId} = action.payload;

  const workspaceList = [];

  state.userInfo.workspaceList.map(workspace => {
    if (workspace.id !== workspaceId) {
      workspaceList.push(workspace);
    }
  });

  const newState = Object.assign({}, state, {
    actionInProgress: false,
    userInfo: {
      ...state.userInfo,
      workspaceList,
    },
  });

  return newState;
};

/**
 * Reducer for auth. Listens to all actions and prepares reduced objects for state.
 * @memberOf initApp.reducers
 *
 * @param {Object} state - Redux state
 * @param {Object} action - Redux action
 * @return {Object}
 */
function auth(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_USER_AUTHENTICATION_STATUS:
      return Object.assign({}, state, {
        loggedIn: true,
      });
    case INVALIDATE_AUTH:
      return Object.assign({}, state, {
        loggedIn: false,
        userInfo: null,
      });
    case USER_INFO_REQUEST:
      return Object.assign({}, state, {
        actionInProgress: true,
      });
    case USER_INFO_REQUEST_ERROR:
      return Object.assign({}, state, {
        actionInProgress: false,
        error: action.error,
      });
    case USER_INFO_REQUEST_SUCCESS:
      return Object.assign({}, state, {
        actionInProgress: false,
        userInfo: action.data,
      });
    case UPDATE_IMAGE:
      return updateImageForCurrentUser(state, action);
    case UPDATE_THEME:
      return updateThemeForCurrentUser(state, action);
    case UPDATE_NAME:
      return updateNameForCurrentUser(state, action);
    case UPDATE_EMAIL:
      return updateEmailForCurrentUser(state, action);
    case DELTE_WORKSPACE:
      return deleteWorkspace(state, action);
    default:
      return state;
  }
}

export default auth;
