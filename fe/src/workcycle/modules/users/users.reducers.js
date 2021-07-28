import {fromJS} from 'immutable';

// constants
import {
  SET_USERS,
  UPDATE_IMAGE,
} from './users.constants';

const INITIAL_STATE = fromJS({
  data: {},
  ids: [],
});

const updateImage = (state, action) => {
  const {
    userId,
    image,
  } = action.payload;

  const userIds = state.get('ids');

  if (userIds.indexOf(userId) !== -1) {
    // user is found in store => update image
    return state.withMutations(
      (nextState) =>
        nextState
          .setIn(['data', `${userId}`, 'img'], image)
    );
  }

  return state;
};

const setUsers = (state, action) => {
  const users = action.payload.users;
  const ids = [];
  const listOfData = {};

  users.map(user => {
    ids.push(user.id);
    listOfData[user.id] = user;
  });

  return state.withMutations((newState) =>
    newState
      .set('ids', ids)
      .set('data', fromJS(listOfData)));
};

const users = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_USERS:
      return setUsers(state, action);
    case UPDATE_IMAGE:
      return updateImage(state, action);
    default:
      return state;
  }
};

export default users;
