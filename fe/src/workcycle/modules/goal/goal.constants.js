/**
 * goal constants
 *
 * @namespace goal.constants
 */

/**
 * Request board action name
 *
 * @memberOf board.actions
 * @name REQUEST_GOAL
 * @const {String}
 * @default 'REQUEST_GOAL'
 */
const REQUEST_GOAL = '@goal/REQUEST_GOAL';

/**
 * Received board action name
 *
 * @memberOf board.actions
 * @name RECEIVED_GOAL
 * @const {String}
 * @default 'RECEIVED_GOAL'
 */
const RECEIVED_GOAL = '@goal/RECEIVED_GOAL';

/**
 * Received board error action name
 *
 * @memberOf board.actions
 * @name RECEIVED_BOARD_ERROR
 * @const {String}
 * @default 'RECEIVED_BOARD_ERROR'
 */
const RECEIVED_GOAL_ERROR = '@goal/RECEIVED_GOAL_ERROR';

/**
 * Invalidate board
 *
 * @memberOf board.actions
 * @name INVALIDATE_GOAL
 * @const {String}
 * @default 'INVALIDATE_GOAL'
 */
const INVALIDATE_GOAL = '@goal/INVALIDATE_GOAL';

export {
  INVALIDATE_GOAL,
  REQUEST_GOAL,
  RECEIVED_GOAL,
  RECEIVED_GOAL_ERROR,
};
