/**
 * @namespace settings.account.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, reduxForm, registerField} from 'redux-form';
import {connect} from 'react-redux';
import l10nService from '../l10n/l10n.service';
import InputField from '../../components/form/inputField/inputField.component';
import settingseService from './settings.service';
import {hideLoader, showLoader} from '../loader/loader.actions';
import Button from '../../components/button/button.component';
import SelectField from '../../components/form/selectField/selectField.component';
import {THEME_NAMES} from '../../contants/colors.constants';
import {addDangerAlert, addSuccessAlert} from '../alerts/alert.actions';
import {dismissDialog} from '../dialog/dialog.actions';

import {updateImage} from './../users/users.actions';
import {
  updateImageForCurrentUser,
  updateThemeForCurrentUser,
  updateNameForCurrentUser,
  updateEmailForCurrentUser,
} from './../auth/auth.actions';

const LOG_PREFIX = '[settings.account]';

/**
 * Board form validation method
 *
 * @private
 * @const {Function}
 * @memberOf board.component
 *
 * @param {Object} values - from values
 * @param {Object} props - component props
 * @return {Object} validations errors
 */
const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate board name
  if (!values.email) {
    errors.email = REQUIRED;
  }

  return errors;
};

class SettingsAccount extends Component {

  state = {theme: ''};

  /**
   * React lifecycle method
   *
   * @instance
   * @memberOf board.component.Board
   * @method componentWillMount
   */
  componentWillMount() {
    // register description field
    this.props.dispatch(registerField('email', 'name', 'Field'));

    this.setState({theme: this.props.userInfo.theme});
  }

  uploadedImage = null;

  /**
   * Success callback when the create board is resolved
   *
   * @instance
   * @memberOf board.component.Board
   * @method handleSuccesOnUpdateSettings
   *
   * @param {Object} apiResponse - the response of the api
   * @param {Object} board - the board object
   */
  handleSuccesOnUpdateSettings(apiResponse, data) {
    const {
      userInfo,
      dispatch,
    } = this.props;

    const userId = userInfo.id;

    dispatch(hideLoader());
    dispatch(addSuccessAlert('Settings saved successfully!'));

    if (this.state.theme) {
      dispatch(updateThemeForCurrentUser(this.state.theme));
    }

    if (apiResponse && apiResponse.image) {
      // dispatch update image action
      const userId = userInfo.id;

      // update users store (all the users from the workspace, is needed for th person field)
      dispatch(updateImage(userId, apiResponse.image));
      dispatch(updateImageForCurrentUser(userId, apiResponse.image));
    }

    if (data.email) {
      dispatch(updateEmailForCurrentUser(userId, data.email));
    }

    if (data.name) {
      dispatch(updateNameForCurrentUser(userId, data.name));
    }
  }

  /**
   * Failure callback when the create board is rejected
   *
   * @instance
   * @memberOf workspace.component.Board
   * @method handleFailureOnUpdateSettings
   */
  handleFailureOnUpdateSettings(error) {
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('There was an error saving your settings. Try again in a couple of minutes.'));
  }

  /**
   * Submit form method
   *
   * @instance
   * @memberOf workspace.component.Board
   * @method submit
   *
   * @param {Object} values - form values
   */
  submit = (values) => {
    const {
      dispatch,
    } = this.props;

    const data = new FormData();
    data.append('file', this.uploadedImage);
    data.append('email', values.email);
    data.append('name', values.name);
    data.append('theme', this.state.theme);
    if (values.password) {
      data.append('password', values.password);
    }

    dispatch(showLoader());

    settingseService.updateAccount(data)
      .then(response => this.handleSuccesOnUpdateSettings(response, values))
      .catch(error => this.handleFailureOnUpdateSettings(error));
  };

  handleCancelUpdateAccount() {
    let f = false;
    if (f) {
      f = true;
    }
  }

  setTheme(val) {
    document.getElementsByTagName('body')[0].className = val;
    this.setState({theme: val});
  }

  onFileChanged(evt) {
    const file = evt.target.files[0];
    this.uploadedImage = file;

    if (FileReader && file) {
      const fr = new FileReader();
      fr.onload = function () {
        document.querySelector('.avatarBg').style.backgroundImage = `url(${fr.result})`;
      };
      fr.readAsDataURL(file);
    }
  }

  render() {
    const accountInfo = {
      img: this.props.userInfo.img,
      name: this.props.userInfo.name,
      email: this.props.userInfo.email,
      theme: this.props.userInfo.theme,
    };

    const themeOptions = [];
    for (const col of Object.keys(THEME_NAMES)) {
      themeOptions.push({label: col, value: col});
    }
    if (!accountInfo.theme) {
      accountInfo.theme = themeOptions[0].value;
    }

    const userImage = `url(${accountInfo.img || '/assets/images/no_image.png'}`;

    return (
      <form onSubmit={this.props.handleSubmit(this.submit)} noValidate className="col-sm-6 col-sm-offset-3">
        <div className="row">
          <div className="col-sm-12 no-gutters form-group">
            <div className="col-xs12 no-gutters-left text-center image-container">
              <div className="avatarBg" style={{backgroundImage: userImage}} />
              <label htmlFor="uploadImageInput">
                <a className="button">
                  <i className="fa fa-edit" /> Change the avatar
                </a>
                <input type="file" id="uploadImageInput" onChange={this.onFileChanged.bind(this)} />
              </label>
            </div>
            <div className="col-xs-12 no-gutters-right">
              <span className="description-field-label">Email</span>
              <Field
                name="email"
                type="text"
                placeholder="FORM.PLACEHOLDER.EMAIL"
                component={InputField}
              />

              <span className="description-field-label">Name</span>
              <Field
                name="name"
                type="text"
                placeholder="FORM.PLACEHOLDER.NAME"
                component={InputField}
              />

              <span className="description-field-label">Theme</span>
              <SelectField
                clearable={false}
                options={themeOptions}
                placeholder="Please select a theme"
                onChangeHandler={this.setTheme.bind(this)}
                selectedValue={this.state.theme}
                // searchable={true}
              />

              <span className="description-field-label">Password</span>
              <Field
                name="password"
                type="password"
                placeholder="FORM.PLACEHOLDER.PASSWORD"
                component={InputField}
              />
            </div>

            <div className="bord-form-actions row">
              <div className="col-xs-6 text-right">
                <Button
                  label="Save"
                  type="primary"
                  shouldSubmitForm={true}
                />
              </div>
              <div className="col-xs-6 text-left">
                <Button
                  label="Cancel"
                  onClick={this.handleCancelUpdateAccount}
                  type="link"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

SettingsAccount.propTypes = {
  company: PropTypes.object,
  userInfo: PropTypes.object,
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
};

let settingsAccountForm = reduxForm({
  form: 'account',
  validate: validateFunction,
})(SettingsAccount);

settingsAccountForm = connect((state, props) => {
  const authStore = state.auth;
  return {
    userInfo: authStore.userInfo,
    initialValues: Object.assign({}, authStore.userInfo),
  };
})(settingsAccountForm);

export default settingsAccountForm;
