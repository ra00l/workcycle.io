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
import invitationService from './invitation.service';

// constants
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
import {addDangerAlert} from '../alerts/alert.actions';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf register.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[invitation.component]';

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

  // validate password
  if (!values.password) {
    errors.password = REQUIRED;
  }

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
class Invitation extends Component {

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
    inviteDetail: null,
  };

  componentWillMount() {
    const {
      dispatch,
      params: {
        token,
      },
    } = this.props;

    dispatch(hideLoader());

    invitationService.getFromToken(token).then((res) => {
      this.setState({inviteDetail: res});
    })
      .catch(err => {
        dispatch(hideLoader());
        this.setState({
          inviteDetail: {
            error: true,
          },
        });
      });
  }

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
    const {
      name,
      password,
    } = values;

    const {
      dispatch,
      params: {
        token,
      },
    } = this.props;

    if (!this.state.hasAgreed) {
      this.setState({agreeError: true});
      return;
    }

    dispatch(showLoader());

    invitationService.acceptInvitation(token, {
      name,
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
        dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
      });
  };

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
        <GeneralFormError errors={error}/>
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

    if (!this.state.inviteDetail) {
      return false;
    } else if (this.state.inviteDetail.error) {
      return (<div className="register">
        <div className="card-form">
          <div className="card-form--title">The invitation link either has already been accepted or does not exist!</div>
        </div>
      </div>);
    }

    return (
      <div className="register">
        <div className="card-form">
          <div className="card-form--title">Accept invitation to {this.state.inviteDetail.workspaceName}</div>

          {this.renderError()}

          <form onSubmit={handleSubmit(this.submit)} noValidate>

            <div className="form-group">
              <label className="control-label">Your Email</label>
              <input type="text" value={this.state.inviteDetail.email} disabled className="form-control"/>
            </div>

            <Field
              name="name"
              type="text"
              component={InputField}
              label="FORM.LABEL.NAME"
              placeholder="FORM.PLACEHOLDER.NAME"
            />

            <Field
              name="password"
              type="password"
              component={InputField}
              label="FORM.LABEL.PASSWORD"
              placeholder="FORM.PLACEHOLDER.PASSWORD"
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
                I agree with Work Cycle <a href="https://www.workcycle.io/data-privacy" target="_blank">Data Privacy
                Policies</a>
              </label>
              {agreeError}
            </div>

            <div className="form-group">
              <button type="submit" className="button button--full-width button--large button--primary">
                Accept invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

Invitation.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

const invitationForm = reduxForm({
  form: 'invitation',
  validate: validateFunction,
})(Invitation);

export default invitationForm;
