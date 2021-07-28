/**
 * @namespace workItemCustomField.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import StatusField from '../../../../components/statusField/status.field.component';

import {updateWorkItemCustomField} from '../../workItems.actions';
import {updateField} from '../../../fields/fields.actions';

class WorkItemSelectorField extends Component {

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

  handleChange = (selectedValue) => {
    const {
      boardId,
      dispatch,
      fieldId,
      workItem,
    } = this.props;
    const newWorkItem = {
      [fieldId]: selectedValue,
    };

    dispatch(updateWorkItemCustomField(boardId, workItem.get('id'), fieldId, newWorkItem));

    this.setState({
      openMenu: false,
    });
  };

  handleUpdateFieldList = (selectorList) => {
    const {
      boardId,
      dispatch,
      field,
      fieldId,
      workspaceId,
    } = this.props;
    const newField = {
      ...field.toJS(),
      meta: selectorList,
    };

    dispatch(updateField(workspaceId, boardId, fieldId, newField));
  }

  getStyle(fieldValue) {
    const style = {
      color: '#ffffff',
    };
    const {field} = this.props;

    if (field.get('meta')) {
      field.get('meta').forEach(item => {
        if (item.get('id') === fieldValue) {
          style.background = item.get('color');
          // style.border = `1px solid ${item.get('color')}`;
        }
      });
    }

    return style;
  }

  renderFieldValue(fieldValue) {
    const {field} = this.props;
    let label = '&nbsp;';

    if (!field.get('meta')) {
      return (<span>{label}</span>);
    }

    field.get('meta').forEach(item => {
      if (item.get('id') === fieldValue) {
        label = item.get('label');
      }
    });

    return (
      <span>{label}</span>
    );
  }

  renderSelectorField() {
    const {field} = this.props;

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
        <StatusField
          field={field}
          handleUpdateFieldList={this.handleUpdateFieldList}
          selectedValueHandler={this.handleChange}
        />
      </IconMenu>
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
    const fieldValue = workItem.get(`${fieldId}`);
    const style = this.getStyle(fieldValue);

    return (
      <div className={classString} style={style}>
        <div className="field-container" onClick={this.handleOnClickOnContainer}>
          {this.renderFieldValue(fieldValue)}
          {this.renderSelectorField()}
        </div>
      </div>
    );
  }
}

WorkItemSelectorField.defaultProps = {};

WorkItemSelectorField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

export default WorkItemSelectorField;
