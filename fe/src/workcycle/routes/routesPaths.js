/**
 * @namespace routesPaths
 */

/**
 * @description Application routes object
 * @memberOf routesPaths
 * @name APP_ROUTES
 * @const {Object}
 */
const APP_ROUTES = {
  contact: {
    path: 'contact',
  },
  entry: {
    path: '/',
  },
  faq: {
    path: 'faq',
  },
  feedback: {
    path: 'send-feedback',
  },
  notFound: {
    path: '*',
  },
  signIn: {
    path: '/signin',
  },
  register: {
    path: '/create',
  },
  invitation: {
    path: '/invitation/:token',
  },
  resetPassword: {
    path: '/reset',
  },
  changePassword: {
    path: ':token',
  },
};

export default APP_ROUTES;
