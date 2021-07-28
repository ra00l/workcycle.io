/**
 * board constants
 *
 * @namespace workspace.constants
 */

/**
 * Request board action name
 *
 * @memberOf board.actions
 * @name REQUEST_BOARD
 * @const {String}
 * @default 'REQUEST_BOARD'
 */
const REQUEST_WORKSPACE = '@workspace/REQUEST_WORKSPACE';

/**
 * Received board action name
 *
 * @memberOf board.actions
 * @name RECEIVED_BOARD
 * @const {String}
 * @default 'RECEIVED_BOARD'
 */
const RECEIVED_WORKSPACE = '@workspace/RECEIVED_WORKSPACE';

/**
 * Received board error action name
 *
 * @memberOf board.actions
 * @name RECEIVED_BOARD_ERROR
 * @const {String}
 * @default 'RECEIVED_BOARD_ERROR'
 */
const RECEIVED_WORKSPACE_ERROR = '@workspace/RECEIVED_WORKSPACE_ERROR';

/**
 * Invalidate board
 *
 * @memberOf board.actions
 * @name INVALIDATE_BOARD
 * @const {String}
 * @default 'INVALIDATE_BOARD'
 */
const INVALIDATE_WORKSPACE = '@workspace/INVALIDATE_WORKSPACE';

const ADD_WORKSPACE = '@workspace/ADD_WORKSPACE';

const GET_WORKSPACEMEMBERS_RECEIVE_SUCCESS = '@workspace/GET_WORKSPACEMEMBERS_RECEIVE_SUCCESS';
const GET_WORKSPACEMEMBERS_RECEIVE_ERROR = '@workspace/GET_WORKSPACEMEMBERS_RECEIVE_ERROR';
const GET_WORKSPACEMEMBERS_REQUEST = '@workspace/GET_WORKSPACEMEMBERS_REQUEST';

export {
  INVALIDATE_WORKSPACE,
  REQUEST_WORKSPACE,
  RECEIVED_WORKSPACE,
  RECEIVED_WORKSPACE_ERROR,
  ADD_WORKSPACE,
  GET_WORKSPACEMEMBERS_RECEIVE_SUCCESS,
  GET_WORKSPACEMEMBERS_RECEIVE_ERROR,
  GET_WORKSPACEMEMBERS_REQUEST,
};
