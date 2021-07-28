/**
 * @namespace changePassword.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import {Field, reduxForm} from 'redux-form';
import classnames from 'classnames';

// services
import l10nService from './../l10n/l10n.service';
import changePasswordService from './changePassword.service';

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
 * @memberOf changePassword.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[changePassword.component]';

/**
 * Change Password form validation method
 *
 * @private
 * @const {Function}
 * @memberOf changePassword.component
 *
 * @param {Object} values - from values
 * @param {Object} props - component props
 * @return {Object} validations errors
 */
const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate new password
  if (!values.newPassword) {
    errors.newPassword = REQUIRED;
  }

  if (!values.confirmNewPassword) {
    errors.confirmNewPassword = REQUIRED;
  } else if (values.newPassword !== values.confirmNewPassword) {
    errors.confirmNewPassword = l10nService.translate('VALIDATIONS.PASSWORD_DO_NOT_MATCH');
  }

  return errors;
};

/**
 * Change password component
 *
 * @class ChangePassword
 * @memberOf changePassword.component
 * @extends React.Component
 *
 * @example
 * <ChangePassword />
 */
class ChangePassword extends Component {

  /**
   * Component state
   *
   * @instance
   * @memberOf changePassword.component.ChangePassword
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
   * @memberOf changePassword.component.ChangePassword
   * @method submit
   *
   * @param {Object} values - form values
   */
  submit = (values) => {
    const {
      newPassword,
    } = values;
    const {
      dispatch,
      params: {
        token,
      },
    } = this.props;

    dispatch(showLoader());
    this.setState({
      error: null,
    });

    changePasswordService.setNewPassword(newPassword, token)
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
   * Render change password errors
   *
   * @instance
   * @memberOf changePassword.component.ChangePassword
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
   * @memberOf changePassword.component.ChangePassword
   * @method renderTitle
   *
   * @return {Object} JSX HTML Content
   */
  renderTitle() {
    const labelKey =
      this.state.displaySuccessStep ?
      'RESET_PASSWORD.GREAT' :
      'RESET_PASSWORD.NEW_PASSWORD';

    const label = l10nService.translate(labelKey);

    return (
      <div className="card-form--title">{label}</div>
    );
  }

  /**
   * Render change password form
   *
   * @instance
   * @memberOf changePassword.component.ChangePassword
   * @method renderChangePasswordForm
   *
   * @return {Object | Boolean} JSX HTML Content | false
   */
  renderChangePasswordForm() {
    const {handleSubmit} = this.props;

    if (!this.state.displaySuccessStep) {
      return (
        <form onSubmit={handleSubmit(this.submit)} noValidate>
          <Field
            name="newPassword"
            type="password"
            component={InputField}
            label="FORM.LABEL.NEW_PASSWORD"
            placeholder="FORM.PLACEHOLDER.PASSWORD"
          />

          <Field
            name="confirmNewPassword"
            type="password"
            component={InputField}
            label="FORM.LABEL.CONFIMR_NEW_PASSWORD"
            placeholder="FORM.PLACEHOLDER.PASSWORD"
          />

          <div className="form-group">
            <button type="submit" className="button button--full-width button--large button--primary">
              {l10nService.translate('BUTTONS.SET_PASSWORD')}
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
   * @memberOf changePassword.component.ChangePassword
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
              {l10nService.translate('RESET_PASSWORD.PASSWORD_WAS_CHANGED')}
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
   * @memberOf changePassword.component.ChangePassword
   * @method renderLinks
   *
   * @return {Object} JSX HTML Content
   */
  renderLinks() {
    return (
      <div className="reset-password--links text-center text--italic">
        <p>
          {l10nService.translate('RESET_PASSWORD.STILL_HAVE_QUESTIONS')}&nbsp;
          <a href="https://www.workcycle.io/contact">
            {l10nService.translate('CONTACT.TITLE')}
          </a>
        </p>
      </div>
    );
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf changePassword.component.ChangePassword
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
          {this.renderChangePasswordForm()}

          {/* display mesasge go to login link when password was changed */}
          {this.renderMessageAndGoToLoginButton()}

          {/* contact us link */}
          {this.renderLinks()}
        </div>
      </div>
    );
  }
}

ChangePassword.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

const changePasswordForm = reduxForm({
  form: 'changePassword',
  validate: validateFunction,
})(ChangePassword);

export default changePasswordForm;
