import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Dialog from 'material-ui/Dialog';

import DependencyField from './../../../../components/dependencyField/dependency.field.component';

import {showDialog} from './../../../dialog/dialog.actions';

class WorkItemDependencyField extends Component {

  state = {
    showModal: false,
  }

  handleOnClickOnContainer = () => {
    this.setState({
      showModal: true,
    });
  }

  closeModal = () => {
    this.setState({
      showModal: false,
    });
  }

  renderFieldValue(fieldValue) {
    const numberOfItems = fieldValue.size || fieldValue.length || 0;

    return (
      <div className="display-value flex flex-center-space-between">
        <div className="display-value-number-of-items">{numberOfItems} items</div>
      </div>
    );
  }

  renderModal() {
    const {
      boardId,
      dispatch,
      field,
      fieldId,
      workItem,
      isGoal,
    } = this.props;
    const fieldValue = workItem.get(`${fieldId}`) && workItem.get(`${fieldId}`).toJS() || [];

    if (!this.state.showModal) {
      return null;
    }

    return (
      <Dialog
        modal={false}
        open={true}
        onRequestClose={this.closeModal}
        className="dependency-material-modal"
      >
        <DependencyField
          boardId={boardId}
          field={field}
          workItem={workItem}
          listOfDependenciesIds={[]}
          listOfDependenciesForCurrentItem={fieldValue}
          closeModal={this.closeModal}
          isGoal={isGoal}
        />
      </Dialog>
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
    const fieldValue = workItem.get(`${fieldId}`) || [];

    return (
      <div className={classString}>
        <div className="field-container" onClick={this.handleOnClickOnContainer}>
          {this.renderFieldValue(fieldValue)}
        </div>

        {this.renderModal()}
      </div>
    );
  }
}

WorkItemDependencyField.defaultProps = {
  isGoal: false,
};

WorkItemDependencyField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
  isGoal: PropTypes.bool,
};

export default WorkItemDependencyField;
