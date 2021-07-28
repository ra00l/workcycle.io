/**
 * settings constants
 *
 * @namespace boards.settings
 */

/**
 * Request workspaces action name
 *
 * @memberOf settings.actions
 * @name REQUEST_WORKSPACES
 * @const {String}
 * @default 'DEPENDENCY_DONE'
 */
const REQUEST_WORKSPACES = '@settings/REQUEST_WORKSPACES';

/**
 * Received boards action name
 *
 * @memberOf settings.actions
 * @name RECEIVED_BOARDS
 * @const {String}
 * @default 'DEPENDENCY_DONE'
 */
const RECEIVED_WORKSPACES = '@settings/RECEIVED_WORKSPACES';

/**
 * Received settings error action name
 *
 * @memberOf settings.actions
 * @name RECEIVED_BOARDS_ERROR
 * @const {String}
 * @default 'DEPENDENCY_DONE'
 */
const RECEIVED_WORKSPACES_ERROR = '@settings/RECEIVED_WORKSPACES_ERROR';

/**
 * Received settings error action name
 *
 * @memberOf settings.actions
 * @name RECEIVED_BOARDS_ERROR
 * @const {String}
 * @default 'DEPENDENCY_DONE'
 */
const ADD_WORKSPACE = '@settings/ADD_WORKSPACE';

const REMOVE_WORKSPACE = '@settings/REMOVE_WORKSPACE';

const WORKSPACE_ROLES = {
  'r': 'Read',
  'rw': 'Read / Write',
  'a': 'Admin',
};

export {
  ADD_WORKSPACE,
  REMOVE_WORKSPACE,
  REQUEST_WORKSPACES,
  RECEIVED_WORKSPACES,
  RECEIVED_WORKSPACES_ERROR,
  WORKSPACE_ROLES,
};
