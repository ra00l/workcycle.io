import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import WorkItemTextField from './fields/workItemTextField.component';
import WorkItemNumberField from './fields/workItemNumberField.component';
import WorkItemPersonField from './fields/workItemPersonField.component';
import WorkItemDateField from './fields/workItemDateField.component';
import WorkItemTimelineField from './fields/workItemTimelineField.component';
import WorkItemSelectorField from './fields/workItemSelectorField.component';
import WorkItemDependencyField from './fields/workItemDependencyField.component';
import WorkItemExternalLinkField from './fields/workItemExternalLinkField.component';
import WorkItemPercentageField from './fields/workItemPercentageField.component';

class WorkItemCustomField extends Component {

  isFieldVisible() {
    const {
      field,
      visibleIn,
    } = this.props;
    const isVisible = true;

    if (field && field.get('visibility')) {
      if (visibleIn === 'BOARD') {
        const fieldVisibility = field.get('visibility');
        return fieldVisibility.get('board');
      }

      return field.get('visibility').get('detail');
    }

    return isVisible;
  }

  renderTextField() {
    return (
      <WorkItemTextField {...this.props} />
    );
  }

  renderNumberField() {
    return (
      <WorkItemNumberField {...this.props} />
    );
  }

  renderPersonField() {
    return (
      <WorkItemPersonField {...this.props} />
    );
  }

  renderDateField() {
    return (
      <WorkItemDateField {...this.props} />
    );
  }

  renderTimelineField() {
    return (
      <WorkItemTimelineField {...this.props} />
    );
  }

  renderSelectorField() {
    return (
      <WorkItemSelectorField {...this.props} />
    );
  }

  renderDependecyField() {
    return (
      <WorkItemDependencyField {...this.props} />
    );
  }

  renderExternalLinkField() {
    return (
      <WorkItemExternalLinkField {...this.props} />
    );
  }

  renderPercentageField() {
    return (
      <WorkItemPercentageField {...this.props} />
    );
  }

  render() {
    const {field} = this.props;

    if (this.isFieldVisible()) {
      switch (field.get('originalType')) {
        case 'short-text':
        case 'text':
          return this.renderTextField();
        case 'number':
          return this.renderNumberField();
        case 'person':
          return this.renderPersonField();
        case 'date':
          return this.renderDateField();
        case 'timeline':
          return this.renderTimelineField();
        case 'selector':
          return this.renderSelectorField();
        case 'dependency':
          return this.renderDependecyField();
        case 'external-link':
          return this.renderExternalLinkField();
        case 'percentage':
          return this.renderPercentageField();
      }
    }

    return false;
  }
}

WorkItemCustomField.defaultProps = {
  visibleIn: 'BOARD',
  isGoal: false,
};

WorkItemCustomField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  visibleIn: PropTypes.string.isRequired,
  workItem: PropTypes.object.isRequired,
  workspaceId: PropTypes.number.isRequired,
  isGoal: PropTypes.bool,
};

export default connect((state, props) => {
  const fieldStore = state.fields;
  const companyStore = state.company;
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;
  const field = fieldStore.getIn(['data', `${props.fieldId}`]) || Map();

  return {
    field,
    workspaceId,
  };
})(WorkItemCustomField);
