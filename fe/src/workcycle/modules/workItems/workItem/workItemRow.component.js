/**
 * @namespace workitemRow.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

// actions
import {showDialog} from '../../dialog/dialog.actions';

// components
import Workitem from './workItem.component';
import WorkitemTitle from './workItemTitle.component';
import WorkitemCustomField from './workItemCustomField.component';

class WorkItemRow extends Component {

  handleClickOnWorkitemTitle = () => {
    // display the modal with the workitem component
    // pass the current workitem so we can display data
    const {
      boardId,
      dispatch,
      workItem,
      itemsFromNest,
      childLevel,
      isChild,
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <Workitem
          boardId={boardId}
          workItem={workItem}
          workItemId={workItem.id}
          nestId={workItem.idNest}
          itemsFromNest={itemsFromNest}
          childLevel={childLevel}
          isChild={isChild}
        />
      ),
      className: 'workitem-modal',
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  renderTitleField() {
    const {
      boardId,
      dispatch,
      itemsFromNest,
      childLevel,
      isChild,
      workItem,
      workItems,
    } = this.props;

    return (
      <WorkitemTitle
        boardId={boardId}
        dispatch={dispatch}
        itemsFromNest={itemsFromNest}
        childLevel={childLevel}
        isChild={isChild}
        workItem={workItem}
        onClick={this.handleClickOnWorkitemTitle}
        workItems={workItems}
      />
    );
  }

  renderCustomeFields() {
    const {
      boardId,
      dispatch,
      fields,
      workItem,
      workSpaceId,
    } = this.props;

    return fields.map((field, index) => (
      <WorkitemCustomField
        key={index}
        boardId={boardId}
        dispatch={dispatch}
        field={field}
        visibleIn="BOARD"
        workItem={workItem}
        workSpaceId={workSpaceId}
      />
    ));
  }

  render() {
    const {workItem} = this.props;

    if (Object.keys(workItem).length === 0) {
      return false;
    }

    return (
      <div className="workitem-row">
        {this.renderTitleField()}

        {this.renderCustomeFields()}
      </div>
    );
  }
}

WorkItemRow.defaultProps = {
  boardId: '',
  dispatch: () => false,
  itemsFromNest: [],
  childLevel: 0,
  isChild: false,
  fields: [],
  workItem: {},
  workItems: {},
};

WorkItemRow.propTypes = {
  boardId: PropTypes.string,
  dispatch: PropTypes.func,
  itemsFromNest: PropTypes.array,
  childLevel: PropTypes.number,
  isChild: PropTypes.bool,
  fields: PropTypes.array,
  workItem: PropTypes.object.isRequired,
  workItems: PropTypes.object,
  workSpaceId: PropTypes.number,
};

export default WorkItemRow;
