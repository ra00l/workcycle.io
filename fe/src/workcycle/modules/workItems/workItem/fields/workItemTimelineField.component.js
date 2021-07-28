/**
 * @namespace workItemCustomField.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {DateRangePicker} from 'react-dates';
import moment from 'moment';

import {updateWorkItemCustomField} from '../../workItems.actions';

class WorkItemTimelineField extends Component {

  state = {
    focusedInput: null,
  };

  handleChange = (dates) => {
    const {
      boardId,
      dispatch,
      field,
      fieldId,
      workItem,
    } = this.props;
    const {
      startDate,
      endDate,
    } = dates;
    let startDateIsoFormat = '';
    let endDateIsoFormat = '';

    if (startDate) {
      startDateIsoFormat = startDate.toISOString();
    }

    if (endDate) {
      endDateIsoFormat = endDate.toISOString();
    }

    const timeline = [startDateIsoFormat, endDateIsoFormat].join('|');

    const newWorkItem = {
      [fieldId]: timeline,
    };

    dispatch(updateWorkItemCustomField(boardId, workItem.get('id'), fieldId, newWorkItem));
  };

  handleFocusOnDateField = (focusedInput) => {
    this.setState({
      focusedInput,
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
    const fieldArray = fieldValue.split('|');
    let startDate = null;
    let endDate = null;

    if (fieldArray[0]) {
      startDate = moment(fieldArray[0]);
    }

    if (fieldArray[1]) {
      endDate = moment(fieldArray[1]);
    }

    return (
      <div className={classString}>
        <div className="field-container">
          <DateRangePicker
            startDate={startDate}
            startDateId="your_unique_start_date_id"
            endDate={endDate}
            endDateId="your_unique_end_date_id"
            onDatesChange={this.handleChange}
            focusedInput={this.state.focusedInput}
            onFocusChange={this.handleFocusOnDateField}
            numberOfMonths={2}
            hideKeyboardShortcutsPanel
            isOutsideRange={() => false}
            withPortal
            showClearDates
          />
        </div>
      </div>
    );
  }
}

WorkItemTimelineField.defaultProps = {};

WorkItemTimelineField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
};

export default WorkItemTimelineField;
