/**
 * @namespace register.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, browserHistory} from 'react-router';
import {Field, reduxForm} from 'redux-form';
import classnames from 'classnames';

// services
import l10nService from './../l10n/l10n.service';
import registerService from './register.service';

// constants
import APP_ROUTES from './../../routes/routesPaths';
import {
  LAST_WORKSPACE_VIEWED,
  SESSION_TOKEN,
  NOT_LOGGED_ID,
} from '../auth/auth.constants';

// actions
import {
  showLoader,
  hideLoader,
} from '../loader/loader.actions';

// components
import InputField from '../../components/form/inputField/inputField.component';
import GeneralFormError from '../../components/form/generalError/generalError.component';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf register.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[register.component]';

/**
 * Registration form validation method
 *
 * @private
 * @const {Function}
 * @memberOf register.component
 *
 * @param {Object} values - from values
 * @param {Object} props - component props
 * @return {Object} validations errors
 */
const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate name
  if (!values.name) {
    errors.name = REQUIRED;
  }

  if (!values.agree) {
    errors.agree = REQUIRED;
  }

  // validate email
  if (!values.email) {
    errors.email = REQUIRED;
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = l10nService.translate('VALIDATIONS.EMAIL');
  }

  // validate company name
  if (!values.companyName) {
    errors.companyName = REQUIRED;
  }

  // validate password
  if (!values.password) {
    errors.password = REQUIRED;
  }


  // team size field is optional

  return errors;
};

/**
 * Register component
 *
 * @class Register
 * @memberOf register.component
 * @extends React.Component
 *
 * @example
 * <Register />
 */
class Register extends Component {

  /**
   * Component state
   *
   * @instance
   * @memberOf register.component.Register
   * @const {Object}
   * @default
   */
  state = {
    error: null,
    hasAgreed: false,
    agreeError: null,
  };

  /**
   * Submit form method
   *
   * @instance
   * @memberOf register.component.Register
   * @method submit
   *
   * @param {Object} values - form values
   */
  submit = (values) => {
    // TODO: dispatch action or call the API directly
    //
    const {
      companyName,
      email,
      name,
      password,
    } = values;
    const {dispatch} = this.props;

    if (!this.state.hasAgreed) {
      this.setState({agreeError: true});
      return;
    }

    dispatch(showLoader());

    registerService.register({
      name,
      email,
      companyName,
      password,
    })
      .then(res => {
        const {
          token,
          workspace,
        } = res;

        dispatch(hideLoader());

        localStorage.setItem(SESSION_TOKEN, token);
        localStorage.setItem(LAST_WORKSPACE_VIEWED, workspace);
        localStorage.removeItem(NOT_LOGGED_ID);

        window.location.href = `/${workspace}`;
      })
      .catch(err => {
        dispatch(hideLoader());
        this.setState({
          error: err.errors,
        });
      });
  }

  /**
   * Render registration errors
   *
   * @instance
   * @memberOf register.component.Register
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
   * @memberOf register.component.Register
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    const {handleSubmit} = this.props;

    let agreeError = null;
    if (this.state.agreeError) {
      agreeError = (<div className="form-group--error">You have to agree to the terms before continuing!</div>);
    }

    return (
      <div className="register">
        <div className="card-form">
          <div className="card-form--title">{l10nService.translate('REGISTER.CREATE_NEW_ACCOUNT')}</div>

          {this.renderError()}

          <form onSubmit={handleSubmit(this.submit)} noValidate>
            <Field
              name="name"
              type="text"
              component={InputField}
              label="FORM.LABEL.NAME"
              placeholder="FORM.PLACEHOLDER.NAME"
            />

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

            <Field
              name="companyName"
              type="text"
              component={InputField}
              label="FORM.LABEL.COMPANY"
              placeholder="FORM.PLACEHOLDER.COMPANY"
            />

            <div className="form-group">
              <label className="control-label">
                <input
                  type="checkbox"
                  id="agree"
                  name="agree"
                  defaultValue={this.state.hasAgreed}
                  onChange={(e) => this.setState({agreeError: null, hasAgreed: e.target.checked})}
                  style={{marginRight: '10px'}}
                />
                I agree with Work Cycle <a href="https://www.workcycle.io/data-privacy" target="_blank">Data Privacy Policies</a>
              </label>
              {agreeError}
            </div>

            <div className="form-group">
              <button type="submit" className="button button--full-width button--large button--primary">
                {l10nService.translate('REGISTER.TITLE')}
              </button>
            </div>

            <div className="register--links text-center text--italic">
              <p>
                {l10nService.translate('LOGIN.ALREADY_HAVE_AN_ACCOUNT')}&nbsp;
                <Link to={APP_ROUTES.signIn.path}>
                  {l10nService.translate('LOGIN.TITLE')}
                </Link>
              </p>
              <p>
                {l10nService.translate('RESET_PASSWORD.STILL_HAVE_QUESTIONS')}&nbsp;
                <a href="https://www.workcycle.io/contact">
                  {l10nService.translate('CONTACT.TITLE')}
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

Register.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

const registrationForm = reduxForm({
  form: 'registration',
  validate: validateFunction,
})(Register);

export default registrationForm;
