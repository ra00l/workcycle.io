import React from 'react';
import {render} from 'react-dom';
import {compose, createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {Router, browserHistory} from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';

// import styling
import './assets/sass/style.sass';

// reducers
import indexReducers from './workcycle/reducers/index.reducers';

// routes
import routes from './workcycle/routes/routes';

// constants
import {DEV_TOOL} from './workcycle/contants/app.constants';

// redux middleware for notifications
import reduxNotificationMiddleware from './workcycle/middlewares/redux.notification.middleware';


/* eslint-disable */
/**
 * supplant() does variable substitution on the string. It scans through the string looking for
 * expressions enclosed in { } braces. If an expression is found, use it as a key on the object,
 * and if the key has a string value or number value, it is substituted for the bracket expression
 * and it repeats.
 *
 * Written by Douglas Crockford
 * http://www.crockford.com/
 */
String.prototype.supplant = function (o) {
  return this.replace(
    /{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
};
/* eslint-enable */

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// Application mounting node
const mountNode = document.getElementById('root');
const environment = process.env.NODE_ENV;

// Middleware
const middleware = [
  thunk,
  reduxNotificationMiddleware,
];

if (environment === 'development') {
  const createLogger = require('redux-logger').createLogger;
  middleware.push(createLogger({
    collapsed: true,
  }));
}

// Creates a Redux store that holds the state tree
const store = createStore(
  indexReducers,
  compose(applyMiddleware(...middleware)),
);

render(
  <Provider store={store}>
    <Router history={browserHistory} routes={routes}/>
  </Provider>,
  mountNode
);

// Work Cycle development only public API
// Do not use in production code
if (environment === 'development') {
  global.wc = {};

  global.wc.getState = (name) => (
    name ? store.getState()[name] : store.getState()
  );

  global.wc.dispatch = store.dispatch;
  global.wc.history = browserHistory;
}

if (environment === 'production' && typeof window !== 'undefined' &&
  window.document && window.document.createElement && window[DEV_TOOL]) {
  // Should disable React DevTools in production
  // See: https://github.com/facebook/react-devtools/issues/191
  window[DEV_TOOL].inject = () => undefined;
}

// Work Cycle public API
global.wc = global.wc || {};

// Expose version as on WC namespace
global.wc.version = process.env.VERSION;

