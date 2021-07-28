import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';

import {SingleDatePicker} from 'react-dates';

import {updateWorkItemCustomField} from '../../workItems.actions';

class WorkItemDateField extends Component {

  state = {
    focused: false,
  };

  handleChange = (date) => {
    const {
      boardId,
      dispatch,
      field,
      fieldId,
      workItem,
    } = this.props;
    let dateIsoFormat = null;

    if (date) {
      dateIsoFormat = date.toISOString();
    }

    const newWorkItem = {
      [fieldId]: dateIsoFormat,
    };

    dispatch(updateWorkItemCustomField(boardId, workItem.get('id'), fieldId, newWorkItem));
  };

  handleFocusOnDateField = (focusedObj) => {
    const {focused} = focusedObj;

    this.setState({
      focused,
    });
  }

  render() {
    const {
      field,
      fieldId,
      workItem,
    } = this.props;
    const classString = classnames('workitem-field', {
      [`field-${field.get('type')}`]: field.get('type'),
    });
    const fieldValue = workItem.get(`${fieldId}`) || '';
    let selectedDate = null;

    if (fieldValue) {
      selectedDate = moment(fieldValue);
    }

    return (
      <div className={classString}>
        <div className="field-container">
          <SingleDatePicker
            date={selectedDate}
            onDateChange={this.handleChange}
            focused={this.state.focused}
            onFocusChange={this.handleFocusOnDateField}
            numberOfMonths={2}
            placeholder="&nbsp;"
            hideKeyboardShortcutsPanel
            isOutsideRange={() => false}
            showClearDate
            withPortal
          />
        </div>
      </div>
    );
  }
}

WorkItemDateField.defaultProps = {};

WorkItemDateField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
};

export default WorkItemDateField;
