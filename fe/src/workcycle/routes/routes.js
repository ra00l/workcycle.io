/**
 * @namespace routes
 */

// constants
import APP_ROUTES from './routesPaths';
import {
  SESSION_TOKEN,
} from '../modules/auth/auth.constants';

// components
import BoardsLandingPage from '../modules/boards/boardsLandingPage.component';
import BoardLandingPage from '../modules/boards/boardLandingPage.component';
import ChangePassword from '../modules/changePassword/changePassword.component';
import Contact from '../modules/contact/contact.component';
import FAQ from '../modules/faq/faq.component';
import Feedback from '../modules/feedback/feedback.component';
import ResetPassword from '../modules/resetPassword/resetPassword.component';
import Dashboard from '../modules/dashboard/dashboard.component';
import InitApp from '../modules/initApp/initApp.component';
import NotFound from '../modules/notFound/notFound.component';
import Register from '../modules/register/register.component';
import SignIn from '../modules/signIn/signIn.component';
import Settings from '../modules/settings/settings.component';
import SettingsAccount from '../modules/settings/settings.account.component';
import SettingsBilling from '../modules/settings/settings.billing.component';
import SettingsPlan from '../modules/settings/settings.plan.component';
import SettingsWorkspace from '../modules/settings/settings.workspace.component';
import GoalsLandingPage from '../modules/goals/goalsLandingPage.component';
import GoalLandingPage from '../modules/goals/goalLandingPage.component';
import Invitation from '../modules/invitation/invitation.component';

/**
 * require authentification on the route
 *
 * @memberOf routes
 * @private
 *
 * @param {Object} nextState - the next state to transition to
 * @return {Boolen} - is the user logged in (has token)
 */
const loggedIn = (nextState) => {
  let isUserLoggedIn = false;

  if (nextState.auth && nextState.auth.token) {
    isUserLoggedIn = true;
  } else if (localStorage.getItem(SESSION_TOKEN)) {
    isUserLoggedIn = true;
  }

  return isUserLoggedIn;
};

/**
 * require authentification on the route
 *
 * @memberOf routes
 * @private
 *
 * @param {Object} nextState - the next state to transition to
 * @param {Function} replace - the replace method from the react-router
 */
const requireAuth = (nextState, replace) => {
  if (!loggedIn(nextState)) {
    replace({
      pathname: APP_ROUTES.signIn.path,
    });
  }
};

/**
 * Redirect / route to login when is not authenticated and redirect to /company when is authenticated
 *
 * @memberOf routes
 * @private
 *
 * @param {Object} nextState - the next state to transition to
 * @param {Function} replace - the replace method from the react-router
 */
const redirectFromRoot = (nextState, replace) => {
  let path = APP_ROUTES.signIn.path;

  if (loggedIn(nextState)) {
    path = '/ ';
  }

  replace({
    pathname: path,
  });
};

/* eslint-disable sort-keys */
/**
 * Properties for react-router, based on it we have Application routing
 *
 * @type {Object}
 * @name routes
 * @memberOf routes
 */
export default {
  breadcrumbName: 'HOME',
  component: InitApp,
  path: APP_ROUTES.entry.path,
  indexRoute: {
    onEnter: redirectFromRoot,
    // component: InitApp, // initialize the app, call the server for dependencies if we have token
                        // redirect to dashboard page
  },
  childRoutes: [
    // authentification routes (login, register, forgot password)
    // -----------------------------------------------------------
    {
      breadcrumbName: 'SIGN_IN',
      path: APP_ROUTES.signIn.path,
      component: SignIn,
    },
    {
      breadcrumbName: 'REGISTER',
      path: APP_ROUTES.register.path,
      component: Register,
    },
    {
      breadcrumbName: 'INVITE',
      path: APP_ROUTES.invitation.path,
      component: Invitation,
    },
    {
      breadcrumbName: 'RESET_PASSWORD',
      path: APP_ROUTES.resetPassword.path,
      component: ResetPassword,
      childRoutes: [
        {
          breadcrumbName: 'CHANGE_PASSWORD',
          path: APP_ROUTES.changePassword.path,
          component: ChangePassword,
        },
      ],
    },

    // faq routes
    // -----------
    {
      breadcrumbName: 'FAQ',
      path: APP_ROUTES.faq.path,
      component: FAQ,
    },

    // contact routes
    // ---------------
    {
      breadcrumbName: 'CONTACT',
      path: APP_ROUTES.contact.path,
      component: Contact,
    },

    // feedback routes
    // FIXME: the feedback component can be standalone on a page, or opened into a modal
    // ----------------
    {
      breadcrumbName: 'FEEDBACK',
      path: 'send-feedback',
      component: Feedback,
    },

    // settings/account routes
    // ----------------
    {
      breadcrumbName: 'ACCOUNT',
      path: 'settings',
      component: Settings,
      onEnter: requireAuth,
      childRoutes: [
        {
          breadcrumbName: 'SETTINGS_ACCOUNT',
          path: 'account',
          component: SettingsAccount,
        },
        {
          breadcrumbName: 'SETTINGS_WORKSPACE',
          path: 'workspace',
          component: SettingsWorkspace,
        },
        {
          breadcrumbName: 'SETTINGS_BILLING',
          path: 'billing',
          component: SettingsBilling,
        },
        {
          breadcrumbName: 'SETTINGS_PLAN',
          path: 'plan',
          component: SettingsPlan,
        },
      ],
    },

    // dashboard routes
    // -----------------
    {
      breadcrumbName: 'DASHBOARD',
      path: ':workspaceId',
      component: Dashboard,
      onEnter: requireAuth,
      childRoutes: [],
    },

    // boards routes
    // --------------
    {
      breadcrumbName: 'BOARDS',
      path: ':workspaceId/boards',
      component: BoardsLandingPage,
      onEnter: requireAuth,
      childRoutes: [
        {
          breadcrumbName: 'BOARD',
          path: ':boardId',
          component: BoardLandingPage,
          childRoutes: [
            {
              breadcrumbName: 'WORKITEM',
              path: 'item/:itemId',
              component: '',
            },
          ],
        },
      ],
    },

    // goals routes
    // -------------
    {
      breadcrumbName: 'GOALS',
      path: ':workspaceId/goals',
      component: GoalsLandingPage,
      onEnter: requireAuth,
      childRoutes: [
        {
          breadcrumbName: 'GOAL',
          path: ':goalId',
          component: GoalLandingPage,
          childRoutes: [
            {
              breadcrumbName: 'WORKITEM',
              path: 'item/:itemId',
              component: '',
            },
          ],
        },
      ],
    },

    // any other route
    // ----------------
    {
      breadcrumbName: 'NOT_FOUND',
      component: NotFound,
      path: APP_ROUTES.notFound.path,
    },
  ],
};
/* eslint-enable sort-keys */
