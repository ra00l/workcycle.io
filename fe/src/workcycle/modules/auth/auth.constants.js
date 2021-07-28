/**
 * Auth constants
 *
 * @namespace auth.constants
 */

/**
 * Name of the variable from localStorage where the token is stored
 *
 * @memberOf auth.constants
 * @const {String}
 * @default
 */
const SESSION_TOKEN = 'workcycle_io_token';

/**
 * Name of the variable from localStorage where the last workspace is stored
 *
 * @memberOf auth.constants
 * @const {String}
 * @default
 */
const LAST_WORKSPACE_VIEWED = 'workcycle_io_last_workspace_viewed';

const NOT_LOGGED_ID = 'workcycle_io_not_logged_in';

/**
 * Set user authentication status action name
 *
 * @memberOf auth.constants
 * @const {String}
 * @default
 */
const SET_USER_AUTHENTICATION_STATUS = '@auth/SET_USER_AUTHENTICATION_STATUS';

/**
 * Invalidate auth action name
 *
 * @memberOf auth.constants
 * @const {String}
 * @default
 */
const INVALIDATE_AUTH = '@auth/INVALIDATE_AUTH';

const USER_INFO_REQUEST = '@auth/USER_INFO_REQUEST';

const USER_INFO_REQUEST_SUCCESS = '@auth/USER_INFO_REQUEST_SUCCESS';

const USER_INFO_REQUEST_ERROR = '@auth/USER_INFO_REQUEST_ERROR';

const UPDATE_IMAGE = '@auth/UPDATE_IMAGE';

const DELTE_WORKSPACE = '@auth/DELTE_WORKSPACE';

const UPDATE_THEME = '@auth/UPDATE_THEME';

const UPDATE_NAME = '@auth/UPDATE_NAME';

const UPDATE_EMAIL = '@auth/UPDATE_EMAIL';

// all
export {
  SESSION_TOKEN,
  LAST_WORKSPACE_VIEWED,
  SET_USER_AUTHENTICATION_STATUS,
  INVALIDATE_AUTH,
  NOT_LOGGED_ID,
  USER_INFO_REQUEST,
  USER_INFO_REQUEST_SUCCESS,
  USER_INFO_REQUEST_ERROR,
  UPDATE_IMAGE,
  DELTE_WORKSPACE,
  UPDATE_THEME,
  UPDATE_NAME,
  UPDATE_EMAIL,
};
