import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import {Map} from 'immutable';

// services
import l10nService from './../l10n/l10n.service';
import nestService from './nests.service';

// actions
import {
  hideLoader,
  showLoader,
} from './../loader/loader.actions';
import {dismissDialog} from './../dialog/dialog.actions';

import {
  addDangerAlert,
  addSuccessAlert,
} from './../alerts/alert.actions';

// components
import InputField from './../../components/form/inputField/inputField.component';
import Button from './../../components/button/button.component';
import {CREATE_NEST_REQUEST_SUCCESS} from './nests.constants';

const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate board name
  if (!values.boardName) {
    errors.boardName = REQUIRED;
  }

  return errors;
};

class NestModal extends Component {

  submit = (values) => {
    const {
      boardId,
      dispatch,
    } = this.props;

    nestService.createNest(boardId, {name: values.name})
      .then(response => this.handleSuccesOnCreateNest(response, {name: values.name}))
      .catch(error => this.handleFailureOnCreateNest(error));
  };

  handleSuccesOnCreateNest(apiResponse, nest) {
    const {dispatch} = this.props;

    dispatch({
      type: CREATE_NEST_REQUEST_SUCCESS,
      payload: {
        nestId: apiResponse.id,
        nest: {
          ...nest,
          id: apiResponse.id,
          sortedWorkItems: [],
        },
      },
    });

    dispatch(dismissDialog());
    dispatch(hideLoader());
    dispatch(addSuccessAlert(`Your nest ${nest.name} has been created.`));
  }

  handleFailureOnCreateFolder(error) {
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
  }

  handleCancelCreateNest = () => {
    const {dispatch} = this.props;
    dispatch(dismissDialog());
  }

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">Manage nest</h3>
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
            onClick={this.handleCancelCreateNest}
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
          name="name"
          type="text"
          component={InputField}
          placeholder="Name of the nest"
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

NestModal.propTypes = {
  boardId: PropTypes.number,
  dispatch: PropTypes.func,
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

let nestForm = reduxForm({
  form: 'board',
  validate: validateFunction,
})(NestModal);

nestForm = connect((state, props) => {
  const {boardId} = state.board;

  return {
    boardId,
  };
})(nestForm);

export default nestForm;
