import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import {Droppable, Draggable} from 'react-beautiful-dnd';

// actions
// import {showDialog} from '../../dialog/dialog.actions';

// components
import WorkItem from './workItem.component';
import WorkItemTitle from './workItemTitle.component';
import WorkItemCustomField from './workItemCustomField.component';

class WorkItemChildrenList extends Component {

  getItemStyle = (draggableStyle, isDragging) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',

    // change background colour if dragging
    background: isDragging ? 'transparent' : 'transparent',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  renderChildren(items) {
    const {
      boardId,
      childLevel,
      isGoal,
    } = this.props;
    const droppableType = `WORKITEM-CHILD-LEVEL-${childLevel}`;

    return (
      <div>
        {
          items.map((itemId, index) => {
            const key = `WORKITEM-${index}-${itemId}`;

            return (
              <Draggable
                key={key}
                draggableId={itemId}
                type={droppableType}
              >
                {
                  (provided, snapshot) => (
                    <div>
                      <div
                        ref={provided.innerRef}
                        style={this.getItemStyle(provided.draggableStyle, snapshot.isDragging)}
                        {...provided.dragHandleProps}
                      >
                        <WorkItem boardId={boardId} childLevel={childLevel + 1} workItemId={itemId} isGoal={isGoal} />
                      </div>
                      {provided.placeholder}
                    </div>
                  )
                }
              </Draggable>
            );
          })
        }
      </div>
    );
  }

  renderChildrenContainer() {
    const {
      childLevel,
      workItem,
    } = this.props;
    const items = workItem.get('items');
    const classString = `workitem-children workitem-children-level-${childLevel}`;

    if (items.size > 0) {
      return (
        <div className={classString}>
          {this.renderChildren(items)}
        </div>
      );
    }

    return false;
  }

  render() {
    const {
      childLevel,
      workItem,
    } = this.props;

    const droppableType = `WORKITEM-CHILD-LEVEL-${childLevel}`;

    if (workItem.size > 0) {
      return (
        <Droppable droppableId={`${workItem.get('id')}`} type={droppableType}>
          {
            (provided, snapshot) => (
              <div ref={provided.innerRef}>
                {this.renderChildrenContainer()}
              </div>
            )
          }
        </Droppable>
      );
    }

    return false;
  }
}

WorkItemChildrenList.defaultProps = {
  isGoal: false,
};

WorkItemChildrenList.propTypes = {
  boardId: PropTypes.string.isRequired,
  childLevel: PropTypes.number.isRequired,
  workItem: PropTypes.object.isRequired,
  isGoal: PropTypes.bool,
};

export default WorkItemChildrenList;
