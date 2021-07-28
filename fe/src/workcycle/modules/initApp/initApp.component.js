/**
 * @namespace initApp.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// services
import browserUtils from '../../services/browser.util.service';

// constants
import {
  NOT_LOGGED_ID,
  SESSION_TOKEN,
} from '../auth/auth.constants';

// actions
import {
  hideLoader,
  showLoader,
} from '../loader/loader.actions';
import {getLocale} from '../l10n/l10n.actions';
import {getDependencySuccess} from './initApp.actions';
import {setAuthenticationStatus, getUserInfo} from '../auth/auth.actions';
import {lastWorkspaceViewed} from '../company/company.actions';

// components
import Header from '../../components/header/header.component';
import Loader from '../loader/loader.component';
import Dialog from './../dialog/dialog.component';
import Alerts from '../alerts/alerts.components';

/**
 * @private
 * @description Prefix for logging
 * @memberOf initApp.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[initApp.component]';

/**
 * Application main component
 *
 * @class InitApp
 * @memberOf initApp.component
 * @extends React.Component
 *
 * @example
 * <InitApp />
 */
export class InitApp extends Component {

  /**
   * Component internal state
   *
   * @memberOf initApp.component.InitApp
   */
  state = {
    dependencyRequestStatus: {
      l10n: false,
      userInfo: false,
    },
    error: false,
    ready: false,
  };

  /**
   * React lifecycle method: componentWillMount
   *
   * @memberOf initApp.component.InitApp
   * @method componentWillMount
   */
  componentWillMount() {
    const {dispatch} = this.props;

    // show loader
    dispatch(showLoader());

    // get user info
    dispatch(getUserInfo(this.props.params.workspaceId));
  }

  /**
   * React lifecycle method: componentWillReceiveProps
   *
   * @memberOf initApp.component.InitApp
   * @method componentWillReceiveProps
   *
   * @param {Object} nextProps - Future properties that will be sent to render
   */
  componentWillReceiveProps(nextProps) {
    const {
      auth,
      dispatch,
      params,
    } = nextProps;

    if (nextProps.initApp.done) {
      if (nextProps.initApp.success) {
        // we have all dependencies
        // localise application title
        if (!this.state.ready) {
          if (localStorage.getItem(SESSION_TOKEN)) {
            dispatch(setAuthenticationStatus());

            localStorage.removeItem(NOT_LOGGED_ID);

            let workspaceId = parseFloat(auth.userInfo.workspaceId);

            if (params && params.workspaceId && !parseFloat(params.workspaceId)) {
              browserHistory.push(`/${workspaceId}`);
            } else if (params && params.workspaceId && parseFloat(params.workspaceId)) {
              workspaceId = parseFloat(params.workspaceId);
            }

            dispatch(lastWorkspaceViewed(parseFloat(workspaceId)));
          }
        }

        // update ready state
        this.setState({ready: true});
      } else {
        this.setState({error: true});
      }
    } else {
      if (nextProps.initApp.userInfo) {
        if (!this.state.dependencyRequestStatus.userInfo) {
          this.setState({
            dependencyRequestStatus: {
              userInfo: true,
            },
          });

          // fetch translations
          dispatch(getLocale());
        }

        if (nextProps.initApp.l10n === true && !this.state.dependencyRequestStatus.l10n) {
          this.setState({
            dependencyRequestStatus: {
              l10n: true,
            },
          });

          dispatch(getDependencySuccess());
          dispatch(hideLoader());
        }
      }
    }
  }

  /**
   * Render block when we have all dependencies available
   *
   * @memberOf initApp.component.App
   * @method renderReady
   *
   * @return {Object} JSX HTML Content
   */
  renderReady() {
    const {
      auth: {
        loggedIn,
        userInfo,
      },
      children,
      params,
      company,
      dispatch,
    } = this.props;

    if (userInfo && userInfo.theme) {
      document.getElementsByTagName('body')[0].className = userInfo.theme;
    }

    return (
      <MuiThemeProvider>
        <div className="wc">
          <Loader />
          <Alerts/>
          <Dialog />

          {/* dialog component */}

          <Header
            company={company}
            isUserLoggedIn={loggedIn}
            params={params}
          />

          {children}
        </div>
      </MuiThemeProvider>
    );
  }


  /**
   * Render block when we have error.
   * Redirect to login page
   *
   * @memberOf initApp.component.App
   * @method renderError
   *
   * @return {Boolean} false
   */
  renderError() {

    // redirect to login
    browserUtils.goToLocation('/signin');

    return false;
  }

  /**
   * React lifecycle method: render
   *
   * @memberOf initApp.component.InitApp
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    if (this.state.ready) {
      return this.renderReady();
    }

    if (this.state.error) {
      return this.renderError();
    }

    return (
      <div>
        <Loader />
      </div>
    );
  }
}

InitApp.propTypes = {
  auth: PropTypes.object,
  children: PropTypes.node,
  company: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  initApp: PropTypes.object,
  loader: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

export default connect((state) => ({
  auth: state.auth,
  company: state.company,
  initApp: state.initApp,
  loader: state.loader,
}))(InitApp);
