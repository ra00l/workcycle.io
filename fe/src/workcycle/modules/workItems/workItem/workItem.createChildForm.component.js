import React, {Component} from 'react';
import PropTypes from 'prop-types';

// services
import l10nService from '../../l10n/l10n.service';
import workItemService from './workItem.service';

// actions
import {dismissDialog} from '../../dialog/dialog.actions';
import {
  addWorkItems,
  addChildWorkItem,
} from '../../workItems/workItems.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from '../../alerts/alert.actions';

// components
import InputField from '../../../components/form/inputField/inputField.component';
import Button from '../../../components/button/button.component';

class WorkItemCreateChildForm extends Component {

  state = {
    inputValue: '',
  }

  componentDidMount() {
    setTimeout(() => {
      this.textInput.focus();
    }, 500);
  }

  submit = () => {
    const workitemEntity = {
      title: this.state.inputValue,
      description: '',
      idNest: this.props.nestId,
      idParent: this.props.childOf,
    };

    this.createChildWorkItem(workitemEntity);
  }

  handleOnChange = (evt) => {
    this.setState({
      inputValue: evt.target.value,
    });
  }

  addChild = (evt) => {
    if (evt.charCode === 13 || evt.keyCode === 13) {
      if (this.state.inputValue !== '') {
        this.submit();
      }
    }
  }

  handleSuccesOnEditWorkitem(responseFromApi, updatedWorkItem) {
    const {
      dispatch,
    } = this.props;

    // add workitem id to the nest store
    dispatch(addWorkItems({
      [responseFromApi.id]: {
        items: [],
        ...updatedWorkItem,
        ...responseFromApi,
      },
    }));

    // push in the workItems.parentId.items
    dispatch(addChildWorkItem(updatedWorkItem.idParent, responseFromApi.id));

    // remove dialog
    dispatch(dismissDialog());

    // display success alert
    dispatch(addSuccessAlert(l10nService.translate('WORKITEMS.WORKITEM.MESSAGES.EDIT_ITEM_WITH_SUCCESS', {
      workitemName: updatedWorkItem.title,
    })));
  }

  handleFailureOnEditWorkitem(errorResponse) {
    const {dispatch} = this.props;
    const {errors} = errorResponse;

    errors.forEach(error => {
      dispatch(addDangerAlert(l10nService.translate(`WORKITEMS.WORKITEM.MESSAGES.${error.code}`)));
    });

    if (errors.length === 0) {
      dispatch(addDangerAlert(l10nService.translate('WORKITEMS.WORKITEM.MESSAGES.GENERIC_ERROR')));
    }
  }

  createChildWorkItem(updatedWorkItem) {
    const {
      boardId,
      dispatch,
    } = this.props;

    workItemService.createWorkItem(boardId, updatedWorkItem)
      .then(response => this.handleSuccesOnEditWorkitem(response, updatedWorkItem))
      .catch(error => this.handleFailureOnEditWorkitem(error));
  }

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">Creating new sub item</h3>
      </div>
    );
  }

  renderFormButtons() {
    return (
      <div className="bord-form-actions row">
        <div className="col-xs-12 text-center">
          <Button
            label="Create"
            type="primary"
            onClick={this.submit}
            disabled={this.state.inputValue === ''}
          />
        </div>
      </div>
    );
  }

  renderInput() {
    return (
      <div className="form-group">
        <input
          type="text"
          className="form-control"
          value={this.state.inputValue}
          onChange={this.handleOnChange}
          onKeyPress={this.addChild}
          placeholder="child item title"
          ref={(input) => { this.textInput = input; }}
          autoFocus
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderInput()}
        {this.renderFormButtons()}
      </div>
    );
  }
}

WorkItemCreateChildForm.defaultProps = {};

WorkItemCreateChildForm.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  nestId: PropTypes.number.isRequired,
  childOf: PropTypes.number.isRequired,
};

export default WorkItemCreateChildForm;
