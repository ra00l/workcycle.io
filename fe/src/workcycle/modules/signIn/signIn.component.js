/**
 * @namespace signIn.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, browserHistory} from 'react-router';
import {Field, reduxForm} from 'redux-form';
import classnames from 'classnames';

// services
import l10nService from './../l10n/l10n.service';
import signInService from './signIn.service';

// actions
import {
  hideLoader,
  showLoader,
} from '../loader/loader.actions';
import {setAuthenticationStatus, getUserInfo} from '../auth/auth.actions';
import {lastWorkspaceViewed} from '../company/company.actions';

// constants
import APP_ROUTES from './../../routes/routesPaths';
import {
  LAST_WORKSPACE_VIEWED,
  SESSION_TOKEN,
  NOT_LOGGED_ID,
} from '../auth/auth.constants';

// components
import InputField from '../../components/form/inputField/inputField.component';
import GeneralFormError from '../../components/form/generalError/generalError.component';

/**
 * @private
 * @description Prefix for logging
 * @memberOf signIn.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[signIn.component]';

/**
 * Login form validation method
 *
 * @private
 * @const {Function}
 * @memberOf signIn.component
 *
 * @param {Object} values - from values
 * @param {Object} props - component props
 * @return {Object} validations errors
 */
const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate email
  if (!values.email) {
    errors.email = REQUIRED;
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = l10nService.translate('VALIDATIONS.EMAIL');
  }

  // validate password
  if (!values.password) {
    errors.password = REQUIRED;
  }

  return errors;
};

/**
 * Sign In (login) component
 *
 * @class SignIn
 * @memberOf signIn.component
 * @extends React.Component
 *
 * @example
 * <SignIn />
 */
class SignIn extends Component {

  /**
   * Component state
   *
   * @instance
   * @memberOf signIn.component.SignIn
   * @const {Object}
   * @default
   */
  state = {
    error: null,
  };

  /**
   * Submit form method
   *
   * @instance
   * @memberOf signIn.component.SignIn
   * @method submit
   *
   * @param {Object} values - form values
   */
  submit = (values) => {
    const {
      email,
      password,
    } = values;
    const {dispatch} = this.props;

    dispatch(showLoader());

    signInService.doLoginWith(email, password)
      .then(res => {
        const {
          token,
          workspaceId,
        } = res;

        dispatch(hideLoader());
        dispatch(setAuthenticationStatus());
        dispatch(lastWorkspaceViewed(workspaceId));

        localStorage.setItem(SESSION_TOKEN, token);
        localStorage.setItem(LAST_WORKSPACE_VIEWED, workspaceId);
        localStorage.removeItem(NOT_LOGGED_ID);

        browserHistory.push(`/${workspaceId}`);

        dispatch(getUserInfo(workspaceId));
      })
      .catch(err => {
        dispatch(hideLoader());
        this.setState({
          error: err.errors,
        });
      });
  }

  /**
   * Render login errors
   *
   * @instance
   * @memberOf signIn.component.SignIn
   * @method renderError
   *
   * @return {Object | Boolean} JSX HTML Content | false
   */
  renderError() {
    const {
      error,
    } = this.state;

    if (error) {
      return (
        <GeneralFormError errors={error} />
      );
    }

    return false;
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf signIn.component.SignIn
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    const {handleSubmit} = this.props;

    return (
      <div className="sign-in">
        <div className="card-form">
          <div className="card-form--title">{l10nService.translate('LOGIN.TITLE')}</div>
          {this.renderError()}

          <form onSubmit={handleSubmit(this.submit)} noValidate>
            <Field
              name="email"
              type="text"
              component={InputField}
              label="FORM.LABEL.EMAIL"
              placeholder="FORM.PLACEHOLDER.EMAIL"
            />

            <Field
              name="password"
              type="password"
              component={InputField}
              label="FORM.LABEL.PASSWORD"
              placeholder="FORM.PLACEHOLDER.PASSWORD"
            />

            <div className="form-group">
              <button type="submit" className="button button--full-width button--large button--primary">
                {l10nService.translate('LOGIN.TITLE')}
              </button>
            </div>

            <div className="form-group text-center">
              <label className="control-label no-margin">{l10nService.translate('LABELS.OR')}</label>
            </div>

            {/* <div className="form-group button-group">
              <button type="button" className="button button--large button--secondary">
                {l10nService.translate('PROVIDERS.GOOGLE')}
              </button>
              <div className="button-divider" />
              <button type="button" className="button button--large button--secondary">
                {l10nService.translate('PROVIDERS.GITHUB')}
              </button>
            </div> */}

            <div className="sign-in--links text-center text--italic">
              <p>
                {l10nService.translate('REGISTER.DO_NOT_HAVE_AN_ACCOUNT')}&nbsp;
                <Link to={APP_ROUTES.register.path}>
                  {l10nService.translate('REGISTER.TITLE')}
                </Link>
              </p>
              <p>
                {l10nService.translate('RESET_PASSWORD.PROBLEMS_WITH_THE_ACCOUNT')}&nbsp;
                <Link to={APP_ROUTES.resetPassword.path}>
                  {l10nService.translate('RESET_PASSWORD.TITLE')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

SignIn.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

const signInForm = reduxForm({
  form: 'signin',
  validate: validateFunction,
})(SignIn);

export default signInForm;
