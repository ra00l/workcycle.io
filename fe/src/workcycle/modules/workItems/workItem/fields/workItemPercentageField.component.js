import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import PercentageField from './../../../../components/percentageField/percentage.field.component';

import {updateWorkItemCustomField} from '../../workItems.actions';
import {updateGoalCompletion} from '../../../goals/goals.actions';

class WorkItemPercentageField extends Component {

  state = {
    openMenu: false,
  };

  handleOnClickOnContainer = () => {
    this.setState({
      openMenu: true,
    });
  }

  handleOnRequestChange = (value) => {
    this.setState({
      openMenu: false,
    });
  }

  onChangeHandlerForPercentageField = (newValue) => {
    const {
      boardId,
      dispatch,
      fieldId,
      workItem,
      isGoal,
    } = this.props;
    const newWorkItem = {
      [fieldId]: newValue,
    };

    dispatch(updateWorkItemCustomField(boardId, workItem.get('id'), fieldId, newWorkItem));

    if (isGoal) {
      const currentValue = workItem.get(`${fieldId}`);
      dispatch(updateGoalCompletion(boardId, workItem.get('id'), currentValue, newValue));
    }
  };

  renderPercentage(fieldValue) {
    return (
      <IconMenu
        iconButtonElement={<IconButton style={{width: '1px', height: '1px', padding: 0}}/>}
        open={this.state.openMenu}
        onRequestChange={this.handleOnRequestChange}
        clickCloseDelay={0}
        targetOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        menuStyle={{
          width: '260px',
          padding: 0,
        }}
        listStyle={{
          padding: 0,
        }}
        menuItemStyle={{
          padding: 0,
        }}
        style={{
          padding: 0,
        }}
      >
        <PercentageField
          value={fieldValue}
          onChange={this.onChangeHandlerForPercentageField}
        />
      </IconMenu>
    );
  }

  renderFieldValue(fieldValue) {

    return (
      <span>{fieldValue} %</span>
    );
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

    const fieldValue = workItem.get(`${fieldId}`) || 0;

    return (
      <div className={classString} onClick={this.handleOnClickOnContainer}>
        <div className="field-container">
          {this.renderPercentage(fieldValue)}
          {this.renderFieldValue(fieldValue)}
        </div>
      </div>
    );
  }
}

WorkItemPercentageField.defaultProps = {
  isGoal: false,
};

WorkItemPercentageField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
  isGoal: PropTypes.bool,
};

export default WorkItemPercentageField;
