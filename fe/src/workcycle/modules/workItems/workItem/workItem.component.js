import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Map} from 'immutable';

// actions
// import {showDialog} from '../../dialog/dialog.actions';

// components
// import Workitem from './workItem.component';
import WorkItemTitle from './workItemTitle.component';
import WorkItemCustomField from './workItemCustomField.component';
import WorkItemChildrenList from './workItemChildrenList.component';

class WorkItem extends Component {

  filter() {
    const {
      boardFilter,
      workItem,
    } = this.props;
    let filtersThatAreCorrect = 0;
    let numberOfFilters = 0;

    // we do not have any filters set
    if (boardFilter.size === 0) {
      return true;
    }

    if (workItem.get('items').size > 0 && (boardFilter.size === 0 || (boardFilter.size === 1 && boardFilter.get('nestId')))) {
      return false;
    }

    for (const key in boardFilter.toJS()) {
      if (boardFilter.toJS().hasOwnProperty(key)) {
        const listOfValues = boardFilter.get(`${key}`);

        if (key !== 'nestId' && listOfValues.toJS().indexOf(workItem.get(`${key}`)) !== -1) {
          filtersThatAreCorrect += 1;
        }
      }
    }

    for (const key in boardFilter.toJS()) {
      if (boardFilter.toJS().hasOwnProperty(key)) {
        const listOfValues = boardFilter.get(`${key}`);
        if (key !== 'nestId') {
          numberOfFilters += 1;
        }
      }
    }

    return numberOfFilters === filtersThatAreCorrect;
  }

  renderWorkItemCustomFields() {
    const {
      boardId,
      fieldOrder,
      workItem,
      isGoal,
    } = this.props;

    return fieldOrder.filter(id => id !== 'TITLE').map((fieldId, index) => {
      const key = `WORKITEM-FIELD-${index}-${fieldId}`;

      return (
        <WorkItemCustomField
          key={index}
          boardId={boardId}
          fieldId={fieldId}
          workItem={workItem}
          isGoal={isGoal}
        />
      );
    });
  }

  renderWorkItemTitle() {
    const {
      boardId,
      dispatch,
      isGoal,
      workItem,
      workspaceId,
    } = this.props;

    return (
      <WorkItemTitle
        boardId={boardId}
        dispatch={dispatch}
        workItem={workItem}
        isGoal={isGoal}
        workspaceId={workspaceId}
      />
    );
  }

  renderRow() {
    return (
      <div>
        {this.renderWorkItemTitle()}
        {this.renderWorkItemCustomFields()}
      </div>
    );
  }

  render() {
    const {
      boardId,
      childLevel,
      workItem,
      isGoal,
    } = this.props;

    if (workItem.size > 0) {
      if (this.filter()) {
        return (
          <div className="workitem-row">
            {this.renderRow()}
  
            <WorkItemChildrenList boardId={boardId} workItem={workItem} childLevel={childLevel} isGoal={isGoal} />
          </div>
        );
      }

      return false;
    }

    return false;
  }
}

WorkItem.defaultProps = {
  // boardId: '',
  // dispatch: () => false,
  // itemsFromNest: [],
  childLevel: 1,
  // isChild: false,
  // fields: [],
  // workItem: {},
  // workItems: {},
  isGoal: false,
};

WorkItem.propTypes = {
  boardId: PropTypes.string.isRequired,
  boardFilter: PropTypes.object.isRequired,
  dispatch: PropTypes.func,
  fieldOrder: PropTypes.object.isRequired,
  // itemsFromNest: PropTypes.array,
  childLevel: PropTypes.number,
  // isChild: PropTypes.bool,
  // fields: PropTypes.array,
  workItem: PropTypes.object.isRequired,
  // workItems: PropTypes.object,
  workItemId: PropTypes.number.isRequired,
  workspaceId: PropTypes.number.isRequired,
  isGoal: PropTypes.bool,
};

export default connect((state, props) => {
  const companyStore = state.company;
  const workItemsStore = state.workItems;
  const fieldStore = state.fields;

  const fieldOrder = fieldStore.get('sorted');
  const workItem = workItemsStore.getIn(['data', `${props.workItemId}`]) || Map();
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;
  const boardFilter = state.boardFilter.get('data');

  return {
    boardFilter,
    fieldOrder,
    workItem,
    workspaceId,
  };
})(WorkItem);
