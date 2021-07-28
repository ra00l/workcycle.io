/**
 * board constants
 *
 * @namespace board.constants
 */

/**
 * Request board action name
 *
 * @memberOf board.actions
 * @name REQUEST_BOARD
 * @const {String}
 * @default 'REQUEST_BOARD'
 */
const REQUEST_BOARD = '@board/REQUEST_BOARD';

/**
 * Received board action name
 *
 * @memberOf board.actions
 * @name RECEIVED_BOARD
 * @const {String}
 * @default 'RECEIVED_BOARD'
 */
const RECEIVED_BOARD = '@board/RECEIVED_BOARD';

/**
 * Received board error action name
 *
 * @memberOf board.actions
 * @name RECEIVED_BOARD_ERROR
 * @const {String}
 * @default 'RECEIVED_BOARD_ERROR'
 */
const RECEIVED_BOARD_ERROR = '@board/RECEIVED_BOARD_ERROR';

/**
 * Invalidate board
 *
 * @memberOf board.actions
 * @name INVALIDATE_BOARD
 * @const {String}
 * @default 'INVALIDATE_BOARD'
 */
const INVALIDATE_BOARD = '@board/INVALIDATE_BOARD';

export {
  INVALIDATE_BOARD,
  REQUEST_BOARD,
  RECEIVED_BOARD,
  RECEIVED_BOARD_ERROR,
};
