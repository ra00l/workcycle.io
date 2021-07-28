/**
 * @namespace company
 */

/**
 * @namespace company.actions
 */

// constants
import {
  COMPANY_SET_LAST_WORKSPACE_VIEWED,
  COMPANY_SET_DATA,
  COMPANY_INVALIDATE,
} from './company.constants';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf company.actions
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[company.actions]';

/**
 * Set company data action
 *
 * @memberOf company.actions
 * @function setCompanyData
 *
 * @param {Object} companyData - company data
 * @return {Object}
 */
const setCompanyData = (companyData) => ({
  type: COMPANY_SET_DATA,
  payload: {
    data: companyData,
  },
});

/**
 * Set last workspace viewed
 *
 * @memberOf company.actions
 * @function lastWorkspaceViewed
 *
 * @param {String} workspaceId - workspaceId
 * @return {Object}
 */
const lastWorkspaceViewed = (workspaceId) => ({
  type: COMPANY_SET_LAST_WORKSPACE_VIEWED,
  payload: {
    data: workspaceId,
  },
});

/**
 * Invalidate company data
 *
 * @memberOf company.actions
 * @function invalidateCompanyData
 *
 * @return {Object}
 */
const invalidateCompanyData = () => ({
  type: COMPANY_INVALIDATE,
});

export {
  setCompanyData,
  lastWorkspaceViewed,
  invalidateCompanyData,
};
