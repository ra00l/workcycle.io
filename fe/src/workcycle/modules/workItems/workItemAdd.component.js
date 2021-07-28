import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';

import workItemService from './workItem/workItem.service';

import {addDangerAlert} from '../alerts/alert.actions';
import {addWorkItems} from './workItems.actions';
import {addWorkItemToNest} from './../nests/nests.actions';
import {addItemToGoal} from './../goals/goals.actions';

import FieldExtraInformation from './workItem/fields/workitemFieldExtraInformation.component';

class AddWorkItem extends Component {

  state = {
    itemName: '',
    isLoading: false,
  };

  getItemStyle = (draggableStyle, isDragging) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',

    // change background colour if dragging
    background: isDragging ? 'transparent' : 'transparent',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  handleChange = (evt) => {
    this.setState({
      itemName: evt.target.value,
    });
  }

  handleKeyUp = (evt) => {
    const {
      boardId,
      dispatch,
      isGoal,
      nestId,
    } = this.props;

    if (evt.keyCode === 13) {
      const workItemThatWillBeCreated = {
        title: this.state.itemName,
        idNest: nestId,
      };

      this.setState({
        isLoading: true,
      });

      // call api to create new workItem
      workItemService.createWorkItem(boardId, workItemThatWillBeCreated)
        .then(response => {
          this.saveWorkItemInTheStore({
            ...workItemThatWillBeCreated,
            ...response,
          });

          // if goal ... update goal store as well
          if (isGoal) {
            dispatch(addItemToGoal(boardId, response.id));
          }
        })
        .catch(err => {
          this.handleAPIError();
        });
    }
  }

  isFieldVisible(field) {
    const isVisible = true;

    if (field && field.get('visibility')) {
      return field.get('visibility').get('board');
    }

    return isVisible;
  }

  saveWorkItemInTheStore(workItem) {
    const {
      dispatch,
      nestId,
    } = this.props;

    const workItemId = workItem.id;

    // add workitem into the items store
    dispatch(addWorkItems({
      [workItemId]: {
        items: [],
        ...workItem,
      },
    }));

    // connect the workitem with the nest
    dispatch(addWorkItemToNest(nestId, workItemId));

    this.resetField();
  }

  handleAPIError() {
    const {dispatch} = this.props;

    dispatch(addDangerAlert('We could not create your work item. Try again in a couple of minutes.'));

    this.setState({
      isLoading: false,
    });
  }

  resetField() {
    this.setState({
      itemName: '',
      isLoading: false,
    });
  }

  renderField() {


    const classString = classnames('field-title workitem-field', {
      'is-loading': this.state.isLoading,
    });

    return (
      <div className={classString}>
        <input
          className="form-control"
          placeholder="Add work item"
          type="text"
          value={this.state.itemName}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
          autoComplete="off"
        />
      </div>
    );
  }

  renderExtraField = (fieldId, index) => {
    const {
      boardId,
      fields,
      nestId,
      workspaceId,
    } = this.props;
    const field = fields.get(`${fieldId}`);

    if (field.get('originalType') && this.isFieldVisible(field)) {
      const classString = `workitem-field field-${field.get('originalType')}`;

      return (
        <div key={index} className={classString}>
          <FieldExtraInformation
            boardId={boardId}
            field={field}
            nestId={nestId}
            workspaceId={workspaceId}
          />
        </div>
      );
    }

    return false;
  }

  renderExtraInformation() {
    const extraFields = this.props.fieldOrder.map((fieldId, index) => this.renderExtraField(fieldId, index));

    return extraFields;
  }

  render() {
    return (
      <div className="add-new-work-item workitem-row">
        {this.renderField()}
        {this.renderExtraInformation()}
      </div>
    );
  }
}

AddWorkItem.defaultProps = {
  isGoal: false,
};

AddWorkItem.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fields: PropTypes.object.isRequired,
  fieldOrder: PropTypes.object.isRequired,
  nestId: PropTypes.number.isRequired,
  workspaceId: PropTypes.number.isRequired,
  isGoal: PropTypes.bool,
};

export default connect((state, props) => {
  const fieldStore = state.fields;
  const companyStore = state.company;
  const fields = fieldStore.get('data') || Map();
  const fieldOrder = fieldStore.get('sorted');
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;

  return {
    fields,
    fieldOrder,
    workspaceId,
  };
})(AddWorkItem);
