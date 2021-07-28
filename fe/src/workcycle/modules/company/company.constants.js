/**
 * company constants
 *
 * @namespace company.constants
 */

/**
 * Set company data action name
 *
 * @memberOf company.actions
 * @name COMPANY_SET_DATA
 * @const {String}
 * @default 'DEPENDENCY_DONE'
 */
const COMPANY_SET_DATA = '@company/COMPANY_SET_DATA';

/**
 * Invalidate company data
 *
 * @memberOf company.actions
 * @name COMPANY_INVALIDATE
 * @const {String}
 * @default 'DEPENDENCY_DONE'
 */
const COMPANY_INVALIDATE = '@company/COMPANY_INVALIDATE';

/**
 * Set last workspce viewed
 *
 * @memberOf company.actions
 * @name COMPANY_SET_LAST_WORKSPACE_VIEWED
 * @const {String}
 * @default 'DEPENDENCY_DONE'
 */
const COMPANY_SET_LAST_WORKSPACE_VIEWED = '@company/COMPANY_SET_LAST_WORKSPACE_VIEWED';

export {
  COMPANY_SET_LAST_WORKSPACE_VIEWED,
  COMPANY_SET_DATA,
  COMPANY_INVALIDATE,
};
