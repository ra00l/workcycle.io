/**
 * @namespace auth
 */

/**
 * @namespace auth.actions
 */

// constants
import {
  SET_USER_AUTHENTICATION_STATUS,
  INVALIDATE_AUTH,
  USER_INFO_REQUEST,
  USER_INFO_REQUEST_SUCCESS,
  USER_INFO_REQUEST_ERROR,
  UPDATE_IMAGE,
  DELTE_WORKSPACE,
  UPDATE_THEME,
  UPDATE_NAME,
  UPDATE_EMAIL,
} from './auth.constants';

import authService from './auth.service';

const privateService = { };

privateService.shouldGet = (state) => {
  const entityFromStore = state.auth;

  if (entityFromStore.actionInProgress || entityFromStore.userInfo) {
    return false;
  }

  return true;
};

privateService.getUserInfo = (workspaceId) => (dispatch, getState) => {
  dispatch({type: USER_INFO_REQUEST});

  authService.getUserInfo(workspaceId)
    .then(response => {
      dispatch({type: USER_INFO_REQUEST_SUCCESS, data: response});
    }, err => {
      dispatch({type: USER_INFO_REQUEST_ERROR, error: err});
    });
};

/**
 * Prefix for logging
 *
 * @private
 * @memberOf auth.actions
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[auth.actions]';

/**
 * Set authentication status action
 *
 * @memberOf auth.actions
 * @function setAuthenticationStatus
 *
 * @return {Function}
 */
const setAuthenticationStatus = () => ({
  type: SET_USER_AUTHENTICATION_STATUS,
});

/**
 * Invalidate auth action
 *
 * @memberOf auth.actions
 * @function invalidateAuth
 *
 * @return {Function}
 */
const invalidateAuth = () => ({
  type: INVALIDATE_AUTH,
});

const getUserInfo = (workspaceId) => (dispatch, getState) => {
  if (privateService.shouldGet(getState())) {
    return dispatch(privateService.getUserInfo(workspaceId));
  }
};

const updateImageForCurrentUser = (userId, image) => (dispatch) => dispatch({
  type: UPDATE_IMAGE,
  payload: {
    userId,
    image,
  },
});


const updateThemeForCurrentUser = (themeName) => (dispatch) =>
  dispatch({
    type: UPDATE_THEME,
    payload: {
      themeName,
    },
  });

const updateNameForCurrentUser = (userId, name) => (dispatch) =>
  dispatch({
    type: UPDATE_NAME,
    payload: {
      userId,
      name,
    },
  });

const updateEmailForCurrentUser = (userId, email) => (dispatch) =>
  dispatch({
    type: UPDATE_EMAIL,
    payload: {
      userId,
      email,
    },
  });

const deleteWorkspace = (workspaceId) => (dispatch) => dispatch({
  type: DELTE_WORKSPACE,
  payload: {
    workspaceId,
  },
});

export {
  setAuthenticationStatus,
  invalidateAuth,
  getUserInfo,
  updateImageForCurrentUser,
  deleteWorkspace,
  updateThemeForCurrentUser,
  updateNameForCurrentUser,
  updateEmailForCurrentUser,
};
