import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Map, List} from 'immutable';

import Nest from './nest.component';
import {Droppable, Draggable} from 'react-beautiful-dnd';

import browserUtilService from '../../services/browser.util.service';

class NestsList extends Component {

  getItemStyle = (draggableStyle, isDragging) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // change background colour if dragging
    background: isDragging ? '#f2f4fb' : 'transparent',
    // styles we need to apply on draggables
    ...draggableStyle,
  });

  renderNests() {
    const {
      boardId,
      boardFilter,
      nestList,
      isGoal,
    } = this.props;
    const listOfNests = boardFilter.get('nestId') || List();

    if (nestList && nestList.size) {
      browserUtilService.scrollToHash();

      return (
        <Droppable droppableId="nest" type="NEST">
          {
            (provided, snapshot) => (
              <div ref={provided.innerRef}>
                {
                  nestList.map((nestId, index) => {
                    const style = {};

                    if (listOfNests.size === 0 || listOfNests.indexOf(nestId) !== -1) {
                      return (
                        <Draggable key={nestId} draggableId={nestId} type="NEST">
                          {
                            (provided, snapshot) => (
                              <div>
                                <div
                                  ref={provided.innerRef}
                                  style={this.getItemStyle(provided.draggableStyle, snapshot.isDragging)}
                                  {...provided.dragHandleProps}
                                >
                                  <Nest index={index} boardId={boardId} nestId={nestId} isGoal={isGoal} />
                                </div>
                                {provided.placeholder}
                              </div>
                            )
                          }
                        </Draggable>
                      );
                    }

                    return false;
                  })
                }
              </div>
            )
          }
        </Droppable>
      );
    }

    return false;
  }

  render() {
    return (
      <div className="nests-list">
        {this.renderNests()}
      </div>
    );
  }
}

NestsList.defaultProps = {
  boardFilter: Map(),
  nestList: {},
  isGoal: false,
};

NestsList.propTypes = {
  boardId: PropTypes.string.isRequired,
  boardFilter: PropTypes.object,
  nestList: PropTypes.object,
  isGoal: PropTypes.bool,
};

export default NestsList;
