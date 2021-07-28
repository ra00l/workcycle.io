import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';

// services
import l10nService from '../l10n/l10n.service';

// actions
import {
  hideLoader,
  showLoader,
} from '../loader/loader.actions';
import {dismissDialog} from '../dialog/dialog.actions';

import {
  addDangerAlert,
  addSuccessAlert,
} from '../alerts/alert.actions';

// components
import InputField from '../../components/form/inputField/inputField.component';
import Button from '../../components/button/button.component';

import browserUtilService from '../../services/browser.util.service';
import authService from './auth.service';
import {LAST_WORKSPACE_VIEWED, SESSION_TOKEN} from './auth.constants';

class LoginAs extends Component {

  submit = (values) => {
    const {dispatch} = this.props;

    authService.loginAs(values.email)
      .then(response => {
        dispatch(hideLoader());

        if (response.token) {
          localStorage.setItem(SESSION_TOKEN, response.token);
          localStorage.setItem(LAST_WORKSPACE_VIEWED, response.lastWorkspaceId);

          window.location.href = `/${response.lastWorkspaceId}`;
        }

        dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
      })
      .catch(error => this.handleFailureLoginAs(error));
  };

  handleFailureLoginAs(error) {
    browserUtilService.error(error);

    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
  }

  handleCancelLoginas = () => {
    const {dispatch} = this.props;
    dispatch(dismissDialog());

    this.props.onClose && this.props.onClose(null);
  }

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">Login as ... </h3>
      </div>
    );
  }

  renderFormButtons() {
    return (
      <div className="bord-form-actions row">
        <div className="col-xs-6 text-right">
          <Button
            label={l10nService.translate('BUTTONS.SAVE')}
            type="primary"
            shouldSubmitForm={true}
          />
        </div>
        <div className="col-xs-6 text-left">
          <Button
            label={l10nService.translate('BUTTONS.CANCEL')}
            onClick={this.handleCancelLoginas}
            type="link"
          />
        </div>
      </div>
    );
  }

  renderForm() {
    return (
      <form onSubmit={this.props.handleSubmit(this.submit)} noValidate>
        <Field
          name="email"
          type="text"
          component={InputField}
          placeholder="Email to use"
        />

        {this.renderFormButtons()}
      </form>
    );
  }

  render() {
    return (
      <div className="board-create">
        {this.renderTitle()}
        {this.renderForm()}
      </div>
    );
  }
}

LoginAs.propTypes = {
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  dispatch: PropTypes.func,
};

let loginAsForm = reduxForm({
  form: 'board',
  validate: () => ({}),
})(LoginAs);

loginAsForm = connect(() => ({
  email: '',
  initialValues: {},
}))(loginAsForm);

export default loginAsForm;
