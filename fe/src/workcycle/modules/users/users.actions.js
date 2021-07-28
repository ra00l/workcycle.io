/**
 * @namespace users
 */

/**
 * @namespace users.actions
 */

import {
  SET_USERS,
  UPDATE_IMAGE,
} from './users.constants';

const setUsers = (users) => (dispatch, getState) =>
  dispatch({
    type: SET_USERS,
    payload: {
      users,
    },
  });

const updateImage = (userId, image) => (dispatch, getState) =>
  dispatch({
    type: UPDATE_IMAGE,
    payload: {
      userId,
      image,
    },
  });

export {
  setUsers,
  updateImage,
};
