/**
 * @namespace resetPassword.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import {Field, reduxForm} from 'redux-form';
import classnames from 'classnames';

// services
import l10nService from './../l10n/l10n.service';
import resetPasswordService from './resetPassword.service';

// constants
import APP_ROUTES from './../../routes/routesPaths';

// actions
import {
  hideLoader,
  showLoader,
} from '../loader/loader.actions';

// components
import InputField from '../../components/form/inputField/inputField.component';
import GeneralFormError from '../../components/form/generalError/generalError.component';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf resetPassword.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[resetPassword.component]';

/**
 * Reset Password form validation method
 *
 * @private
 * @const {Function}
 * @memberOf resetPassword.component
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

  return errors;
};

/**
 * Reset password component
 *
 * @class ResetPassword
 * @memberOf resetPassword.component
 * @extends React.Component
 *
 * @example
 * <ResetPassword />
 */
class ResetPassword extends Component {

  /**
   * Component state
   *
   * @instance
   * @memberOf resetPassword.component.ResetPassword
   * @const {Object}
   */
  state = {
    displaySuccessStep: false,
    error: null,
  };

  /**
   * Submit form method
   *
   * @instance
   * @memberOf resetPassword.component.ResetPassword
   * @method submit
   *
   * @param {Object} values - form values
   */
  submit = (values) => {
    const {
      email,
    } = values;
    const {dispatch} = this.props;

    dispatch(showLoader());
    this.setState({
      error: null,
    });

    resetPasswordService.resetPassword(email)
      .then(res => {
        dispatch(hideLoader());
        this.setState({
          displaySuccessStep: true,
        });
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
   * @memberOf resetPassword.component.ResetPassword
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
   * Render card title
   *
   * @instance
   * @memberOf resetPassword.component.ResetPassword
   * @method renderTitle
   *
   * @return {Object} JSX HTML Content
   */
  renderTitle() {
    const labelKey =
      this.state.displaySuccessStep ?
      'RESET_PASSWORD.CHECK_YOUR_EMAIL' :
      'RESET_PASSWORD.TITLE';

    const label = l10nService.translate(labelKey);

    return (
      <div className="card-form--title">{label}</div>
    );
  }

  /**
   * Render reset password form
   *
   * @instance
   * @memberOf resetPassword.component.ResetPassword
   * @method renderResetPasswordForm
   *
   * @return {Object | Boolean} JSX HTML Content | false
   */
  renderResetPasswordForm() {
    const {handleSubmit} = this.props;

    if (!this.state.displaySuccessStep) {
      return (
        <form onSubmit={handleSubmit(this.submit)} noValidate>
          <Field
            name="email"
            type="text"
            component={InputField}
            label="FORM.LABEL.EMAIL"
            placeholder="FORM.PLACEHOLDER.EMAIL"
          />

          <div className="form-group">
            <button type="submit" className="button button--full-width button--large button--primary">
              {l10nService.translate('BUTTONS.RESET_MY_PASSWORD')}
            </button>
          </div>
        </form>
      );
    }

    return false;
  }

  /**
   * Render message and go to login button when the password was changed with success
   *
   * @instance
   * @memberOf resetPassword.component.ResetPassword
   * @method renderMessageAndGoToLoginButton
   *
   * @return {Object | Boolean} JSX HTML Content | false
   */
  renderMessageAndGoToLoginButton() {
    if (this.state.displaySuccessStep) {
      return (
        <div>
          <div className="form-group">
            <label className="control-label">
              {l10nService.translate('RESET_PASSWORD.WE_SENT_YOU_AN_RESET_PASSWORD_EMAIL')}
            </label>
          </div>
          <Link to={APP_ROUTES.signIn.path}>
            <div className="form-group">
              <button type="button" className="button button--full-width button--large button--primary">
                {l10nService.translate('BUTTONS.BACK_TO_LOGIN')}
              </button>
            </div>
          </Link>
        </div>
      );
    }

    return false;
  }

  /**
   * Render links
   *
   * @instance
   * @memberOf resetPassword.component.ResetPassword
   * @method renderLinks
   *
   * @return {Object} JSX HTML Content
   */
  renderLinks() {
    const links = [];

    if (!this.state.displaySuccessStep) {
      links.push(
        <p key="LOGIN_LINK">
          {l10nService.translate('LOGIN.ALREADY_HAVE_AN_ACCOUNT')}&nbsp;
          <Link to={APP_ROUTES.signIn.path}>
            {l10nService.translate('LOGIN.TITLE')}
          </Link>
        </p>
      );
    }

    links.push(
      <p key="CONTACT_LINK">
        {l10nService.translate('RESET_PASSWORD.STILL_HAVE_QUESTIONS')}&nbsp;
        <a href="https://www.workcycle.io/contact">
          {l10nService.translate('CONTACT.TITLE')}
        </a>
      </p>
    );

    return (
      <div className="reset-password--links text-center text--italic">
        {links}
      </div>
    );
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf resetPassword.component.ResetPassword
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    const {
      children,
      handleSubmit,
    } = this.props;

    // if we have children, render childrens
    if (children) {
      return children;
    }

    return (
      <div className="reset-password">
        <div className="card-form">
          {/* card title */}
          {this.renderTitle()}

          {/* render reset password errors */}
          {this.renderError()}

          {/* change password form */}
          {this.renderResetPasswordForm()}

          {/* display mesasge go to login link when password was changed */}
          {this.renderMessageAndGoToLoginButton()}

          {/* contact us link */}
          {this.renderLinks()}
        </div>
      </div>
    );
  }
}

ResetPassword.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

const resetPasswordForm = reduxForm({
  form: 'resetPassword',
  validate: validateFunction,
})(ResetPassword);

export default resetPasswordForm;
