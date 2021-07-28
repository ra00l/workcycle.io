import keyBy from 'lodash.keyby';
import orderBy from 'lodash.orderby';

import {
  INVALIDATE_BOARD,
  REQUEST_BOARD,
  RECEIVED_BOARD,
  RECEIVED_BOARD_ERROR,
} from './board.constants';

import {SESSION_TOKEN} from './../../auth/auth.constants';

// services
import boardService from './board.service';

// actions
import {setNests} from './../../nests/nests.actions';
import {setFields} from './../../fields/fields.actions';
import {setUsers} from './../../users/users.actions';
import {addWorkItems} from './../../workItems/workItems.actions';

const privateService = {};

// // Private area
// // -------------

// receive board data
privateService.receive = (data, boardId) => ({
  payload: {
    fields: data.fields,
    nests: data.nests,
    users: data.users,
    boardId,
  },
  type: RECEIVED_BOARD,
});

// /**
//  * Error callback when retrieving entity
//  *
//  * @private
//  * @memberOf board.actions
//  *
//  * @param {Object} errorData - Error object
//  * @return {Object} Redux action
//  */
// privateService.receiveError = (errorData) => ({
//   payload: {
//     error: errorData,
//   },
//   type: RECEIVED_BOARD_ERROR,
// });

privateService.getNests = (nests) => {
  const nestObject = {};
  const nestMap = keyBy(nests, 'id');
  const sortedNests = [];
  nests.map(nest => {
    sortedNests.push(nest.id);
  });

  sortedNests.forEach(nestId => {
    const nest = nestMap[nestId];
    const sortedWorkItems = [];

    // add the parents workitems
    orderBy(nest.workItems, 'order', 'asc').forEach(workItem => {
      if (!workItem.idParent) {
        sortedWorkItems.push(workItem.id);
      }
    });

    nestObject[nestId] = {
      color: nest.color,
      id: nest.id,
      name: nest.name,
      sortedWorkItems,
    };
  });

  return {
    nests: nestObject,
    sorted: sortedNests,
  };
};

privateService.getWorkItems = (nests) => {
  const workItems = {};

  nests.forEach(nest => {
    nest.workItems.forEach(workItem => {
      const items = [];
      workItems[workItem.id] = workItem;

      // add child workItems
      orderBy(nest.workItems, 'order', 'asc').forEach(item => {
        if (item.idParent && workItem.id === item.idParent) {
          items.push(item.id);
        }
      });

      workItems[workItem.id].items = items;
    });
  });

  return workItems;
};

privateService.getFields = (fields) => {
  const fieldsObject = {};
  const fieldsSorted = [];
  const fieldsOrder = orderBy(fields, 'order', 'asc');

  fieldsOrder.forEach(field => {
    fieldsObject[field.id] = field;
    fieldsSorted.push(field.id);
  });

  return {
    fields: fieldsObject,
    sorted: fieldsSorted,
  };
};

privateService.getNestsAndWorkItems = (boardId) => (dispatch, getState) => {
  dispatch({
    type: REQUEST_BOARD,
    payload: {
      boardId,
    },
  });

  boardService.getNestsAndWorkItems(boardId)
    .then(response => {
      const {
        fields,
        nests,
        users,
      } = response;
      const workItems = privateService.getWorkItems(nests);
      const formattedNests = privateService.getNests(nests);
      const fieldsStore = privateService.getFields(fields);

      dispatch(setFields(fieldsStore));
      dispatch(setUsers(users));
      dispatch(setNests(formattedNests));
      dispatch(addWorkItems(workItems));
      dispatch(privateService.receive(response, boardId));
    }, err => {
      // dispatch(privateService.receiveError(err));
    });
};

// should get info about this board
privateService.shouldGetNestsAndWorkItems = (boardId, state) => {
  const board = state.board;
  const isUserLoggedIn = localStorage.getItem(SESSION_TOKEN) || false;

  if (!isUserLoggedIn || (board.boardId === parseFloat(boardId) || board.actionInProgress)) {
    return false;
  }

  return true;
};

// End private area
// -----------------

const getBoardNestsAndWorkItems = (boardId) => (dispatch, getState) => {
  if (privateService.shouldGetNestsAndWorkItems(boardId, getState())) {
    return dispatch(privateService.getNestsAndWorkItems(boardId));
  }
};

export {
  getBoardNestsAndWorkItems,
};
