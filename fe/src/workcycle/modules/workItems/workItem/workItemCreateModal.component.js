import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import {Map} from 'immutable';

// services
import l10nService from '../../l10n/l10n.service';
import nestService from '../workItems.service';

// actions
import {
  hideLoader,
  showLoader,
} from '../../loader/loader.actions';
import {dismissDialog} from '../../dialog/dialog.actions';

import {
  addDangerAlert,
  addSuccessAlert,
} from './../../alerts/alert.actions';

// components
import InputField from './../../../components/form/inputField/inputField.component';
import Button from './../../../components/button/button.component';
import workItemService from './workItem.service';
import {addWorkItems} from '../workItems.actions';
import {addWorkItemToNest} from '../../nests/nests.actions';

import browserUtilService from '../../../services/browser.util.service';
import SelectField from '../../../components/form/selectField/selectField.component';
import boardService from '../../boards/board/board.service';


const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate board name
  if (!values.boardName) {
    errors.boardName = REQUIRED;
  }

  return errors;
};

class WorkItemCreateModal extends Component {

  state = {
    nestList: [],
    selectedNest: null,
  };

  componentWillMount() {
    const {
      boardId,
      workspaceId,
      dispatch,
    } = this.props;

    boardService.getNests(workspaceId, boardId)
      .then(response => {
        const nestList = response.map((n) => ({label: n.name, value: n.id}));
        let defaultNest = response.find(n => n.isDefault);
        if (!defaultNest) {
          defaultNest = response[0];
        }

        this.setState({nestList: nestList, selectedNest: defaultNest.id});
      })
      .catch(error => {
        dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
      });
  }

  submit = (values) => {
    const {
      boardId,
      dispatch,
    } = this.props;

    const workItemToCreate = {title: values.name, idNest: this.state.selectedNest};

    workItemService.createWorkItem(boardId, workItemToCreate)
      .then(response => this.handleSuccesOnCreateWorkItem(response, workItemToCreate))
      .catch(error => this.handleFailureOnCreateWorkItem(error));
  };

  handleSuccesOnCreateWorkItem(apiResponse, workItem) {
    const {
      dispatch,
    } = this.props;

    const workItemId = apiResponse.id;

    const mergedWorkItem = {
      ...apiResponse,
      ...workItem,
    };

    // add workitem into the items store
    dispatch(addWorkItems({
      [workItemId]: {
        items: [],
        ...mergedWorkItem,
      },
    }));

    // connect the workitem with the nest
    dispatch(addWorkItemToNest(apiResponse.idNest, workItemId, apiResponse.order));

    dispatch(dismissDialog());
    dispatch(hideLoader());
    dispatch(addSuccessAlert('Your work item has been created.'));

    this.props.onClose && this.props.onClose(workItemId);
  }

  handleFailureOnCreateWorkItem(error) {
    browserUtilService.error(error);

    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
  }

  handleCancelCreateWorkItem = () => {
    const {dispatch} = this.props;
    dispatch(dismissDialog());

    this.props.onClose && this.props.onClose(null);
  }

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">Create work item</h3>
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
            onClick={this.handleCancelCreateWorkItem}
            type="link"
          />
        </div>
      </div>
    );
  }

  renderForm() {
    return (
      <form onSubmit={this.props.handleSubmit(this.submit)} noValidate>
        <SelectField
          clearable={false}
          options={this.state.nestList}
          label="FORM.LABEL.NEST"
          placeholder="Please select a nest"
          onChangeHandler={(val) => this.setState({selectedNest: val})}
          selectedValue={this.state.selectedNest || 0}
          searchable={false}
        />

        <Field
          name="name"
          type="text"
          component={InputField}
          placeholder="Title of the work item"
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

WorkItemCreateModal.propTypes = {
  boardId: PropTypes.number,
  workspaceId: PropTypes.number,
  dispatch: PropTypes.func,
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

let workItemCreateForm = reduxForm({
  form: 'board',
  validate: validateFunction,
})(WorkItemCreateModal);

workItemCreateForm = connect((state, props) => {
  const {boardId} = state.board;
  const {workspaceId} = state.auth.userInfo;

  return {
    boardId,
    workspaceId,
  };
})(workItemCreateForm);

export default workItemCreateForm;
