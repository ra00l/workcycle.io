/**
 * @namespace workItemCustomField.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// component
import {RIEInput} from 'riek';

// action
import {updateWorkItemCustomField} from '../../workItems.actions';

class WorkItemNumberField extends Component {

  getUnit() {
    const {field} = this.props;
    const fieldUnit = field.getIn(['meta', 'unit']);

    if (fieldUnit && fieldUnit !== 'None') {
      return field.getIn(['meta', 'unit']);
    }

    return '';
  }

  onChangeHandlerForTextField = (newChangeObject) => {
    const {
      boardId,
      dispatch,
      fieldId,
      workItem,
    } = this.props;
    const newWorkItem = {
      [fieldId]: newChangeObject.fieldValue,
    };

    dispatch(updateWorkItemCustomField(boardId, workItem.get('id'), fieldId, newWorkItem));
  };

  formatInteger = (numberValue) => {
    const unit = this.getUnit();

    return `${numberValue.toString()} ${unit}`;
  }

  render() {
    const {
      field,
      workItem,
    } = this.props;

    const classString = classnames('workitem-field', {
      [`field-${field.get('type')}`]: field.get('type'),
    });

    const fieldValue = workItem.get(`${field.get('id')}`) || 0;

    return (
      <div className={classString}>
        <div className="field-container">
          <RIEInput
            change={this.onChangeHandlerForTextField}
            value={fieldValue}
            format={this.formatInteger}
            propName="fieldValue"
            className="field-placeholder"
            classEditing="field-edit"
          />
        </div>
      </div>
    );
  }
}

WorkItemNumberField.defaultProps = {};

WorkItemNumberField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
};

export default WorkItemNumberField;
