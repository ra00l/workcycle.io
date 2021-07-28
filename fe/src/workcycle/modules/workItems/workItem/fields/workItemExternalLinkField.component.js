/**
 * @namespace workItemCustomField.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {RIEInput} from 'riek';

import {updateWorkItemCustomField} from '../../workItems.actions';

class WorkItemExternalLinkField extends Component {

  openLink = () => {
    const {
      field,
      fieldId,
      workItem,
    } = this.props;

    let url = workItem.get(`${fieldId}`) || ' ';

    if (url && url !== ' ') {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`;
      }
      // open the link in a new window
      window.open(url, '_blank');
    }
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

  render() {
    const {
      field,
      fieldId,
      workItem,
    } = this.props;

    const classString = classnames('workitem-field', {
      [`field-${field.get('type')}`]: field.get('type'),
    });

    const fieldValue = workItem.get(`${fieldId}`) || ' ';

    return (
      <div className={classString}>
        <div className="field-container field-container-external-link">
          <RIEInput
            change={this.onChangeHandlerForTextField}
            value={fieldValue}
            propName="fieldValue"
            className="field-placeholder"
            classEditing="field-edit"
          />
        </div>

        {
          fieldValue && fieldValue !== ' ' ?
            <div className="field-link-icon" onClick={this.openLink}>
              <i className="fas fa-external-link-alt" />
            </div> :
            false
        }
      </div>
    );
  }
}

WorkItemExternalLinkField.defaultProps = {};

WorkItemExternalLinkField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
};

export default WorkItemExternalLinkField;
