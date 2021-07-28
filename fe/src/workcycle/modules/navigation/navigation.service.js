/**
 * @namespace navigation.service
 */

// services

// constants
import APP_ROUTES from '../../routes/routesPaths';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf navigation.service
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[navigation.service]';

/**
 * Navigation service
 *
 * @memberOf navigation.service
 * @name registerService
 * @const {Object}
 */
const navigationService = {};

/**
 * Get Navigation Items
 *
 * @memberOf navigation.service
 * @method getNavItems
 *
 * @param {Number} workspaceId - workspace id
 * @return {Array<Object>}
 */
navigationService.getNavItems = (workspaceId) => {
  const items = [
    {
      labelKey: 'BOARDS.TITLE',
      path: `/${workspaceId}/boards`,
      isModal: false,
    },
    {
      labelKey: 'GOALS.TITLE',
      path: `/${workspaceId}/goals`,
      isModal: false,
    },
    {
      labelKey: 'TUTORIALS.TITLE',
      path: 'https://www.workcycle.io/academy',
      isModal: false,
    },
    {
      labelKey: 'CONTACT.TITLE',
      path: 'https://www.workcycle.io/contact',
      isModal: false,
    },
    {
      labelKey: 'FEEDBACK.NAV_TITLE',
      path: 'https://www.workcycle.io/feature-request',
      isModal: true,
    },
  ];

  return items;
};

export default navigationService;
