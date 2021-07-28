import React, {Component} from 'react';
import PropTypes from 'prop-types';

// components
import WorkItem from './workItem/workItem.component';
import {
  Draggable,
  // Droppable,
} from 'react-beautiful-dnd';

// constants
// import {MAX_LEVEL_OF_CHILDS} from './../../contants/workItem.constants';

class WorkItemsList extends Component {

  getItemStyle = (draggableStyle, isDragging) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',

    // change background colour if dragging
    background: isDragging ? 'transparent' : 'transparent',

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  renderWorkItems() {
    const {
      boardId,
      itemsIds,
      isGoal,
    } = this.props;

    return (
      <div>
        {
          itemsIds.map((workItemId, index) => {
            const key = `WORKITEM-${index}-${workItemId}`;

            return (
              <Draggable
                key={key}
                draggableId={workItemId}
                type="WORKITEM"
              >
                {
                  (provided, snapshot) => (
                    <div>
                      <div
                        ref={provided.innerRef}
                        style={this.getItemStyle(provided.draggableStyle, snapshot.isDragging)}
                        {...provided.dragHandleProps}
                      >
                        <WorkItem boardId={boardId} workItemId={workItemId} isGoal={isGoal} />
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

  render() {
    return (
      <div className="workitems-list">
        {this.renderWorkItems()}
      </div>
    );
  }
}

WorkItemsList.defaultProps = {
  isGoal: false,
};

WorkItemsList.propTypes = {
  boardId: PropTypes.string.isRequired,
  itemsIds: PropTypes.object.isRequired,
  isGoal: PropTypes.bool,
};

export default WorkItemsList;
