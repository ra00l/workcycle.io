/**
 * @namespace boardDetailed.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';

// actions
import {removeBoard} from './boards.actions';
import {getBoardNestsAndWorkItems} from './../boards/board/board.actions';
import {
  createNest,
  reorderNest,
  updateNest,
  reorderWorkItemInNest,
} from '../nests/nests.actions';
import {reOrderWorkItem} from '../workItems/workItems.actions';
import {
  hideLoader,
  showLoader,
} from '../loader/loader.actions';
import {showConfirmationDialog} from '../dialog/dialog.actions';

// services
import boardsService from './boards.service';

// components
import BoardsList from '../boards/boards.list.component';
import Button from '../../components/button/button.component';
import NestsList from '../nests/nests.list.component';
import {DragDropContext} from 'react-beautiful-dnd';

/**
 * @private
 * @description Prefix for logging
 * @memberOf boardDetailed.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[boardDetailed.component]';

/**
 * BoardDetailed component
 *
 * @class BoardDetailed
 * @memberOf boardDetailed.component
 * @extends React.Component
 *
 * @example
 * <BoardDetailed />
 */
class BoardDetailed extends Component {

  state = {
    dragType: '',
    newNestName: '',
  };

  componentWillMount() {
    const {
      boardId,
      dispatch,
    } = this.props;

    dispatch(getBoardNestsAndWorkItems(boardId));
    this.showHideLoader(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {
      boardId,
      dispatch,
    } = nextProps;

    // get workitems
    dispatch(getBoardNestsAndWorkItems(boardId));
    this.showHideLoader(nextProps);
  }

  showHideLoader(props) {
    const {
      board,
      boards,
      dispatch,
      workItems,
    } = props;

    if (board.actionInProgress) {
      dispatch(showLoader());
    } else {
      dispatch(hideLoader());
    }
  }

  handleChangeOnAddNewNest = (evt) => {
    this.setState({
      newNestName: evt.target.value,
    });
  }

  handleKeyUpOnAddNewNest = (evt) => {
    const {
      boardId,
      dispatch,
    } = this.props;

    if (evt.keyCode === 13) {
      dispatch(createNest(boardId, {
        name: this.state.newNestName,
      }));

      // reset the field value
      this.setState({
        newNestName: '',
      });
    }
  }

  removeBoard = () => {
    const options = {
      closeCb: () => false,
      content: (
        <div>
          <h4 className="confirmation-message">Delete board</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following board
            <span className="text--italic"> {this.props.currentBoard.name}</span> ?
            Please be aware that everything will be lost and you can't undo this action.
          </p>
        </div>
      ),
    };
    const buttons = {
      clickCb: this.remove,
      label: 'Delete',
    };

    this.props.dispatch(showConfirmationDialog(options, buttons));
  }

  remove = () => {
    const {
      boardId,
      dispatch,
      company: {
        lastWorkspace,
      },
    } = this.props;

    boardsService.removeBoard(lastWorkspace, boardId)
      .then(response => {
        dispatch(removeBoard(boardId));
        browserHistory.push(`/${lastWorkspace}`);
      })
      .catch(err => {
        // TODO: add something here
      });
  }

  renderBoardsList() {
    const {boardId} = this.props;

    return (
      <BoardsList />
    );
  }

  renderBoardTitleAndActionsContainer() {
    const {currentBoard} = this.props;

    return (
      <div className="board-title-actions-section">
        <div className="container">
          <div className="flex-center-space-between">
            <div className="board-title">{currentBoard.name}</div>
            <div className="board-actions">
              <ul>
                {/* <li><i className="fab fa-github" />Last sync 20/09/17</li>
                <li><a onClick={this.refreshItems}><i className="fas fa-sync" /></a></li>
                <li><a onClick={this.importItems}><i className="fas fa-upload" /></a></li> */}
                {/* <li><a onClick={this.boardSettings}><i className="fas fa-cog" /></a></li> */}
                <li><a onClick={this.removeBoard}><i className="fas fa-trash" /></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  reorderNest(nestId, destination) {
    const {
      boardId,
      dispatch,
    } = this.props;

    // the reorder of nest now possible only inside a board
    if (destination) {
      dispatch(updateNest(boardId, nestId, {order: destination.index + 1}));
      dispatch(reorderNest(nestId, destination.index));
    }
  }

  reorderWorkItem(workItemId, fromSource, toDestination) {
    const {
      boardId,
      dispatch,
    } = this.props;

    // the reorder of workitem now possible only inside a board
    if (toDestination) {
      dispatch(reOrderWorkItem(boardId, workItemId, fromSource, toDestination));
    }
  }

  onDragEnd = (result) => {
    const {
      destination,
      source,
      draggableId,
      type,
    } = result;

    switch (type) {
      case 'NEST':
        this.reorderNest(draggableId, destination);
        break;
      case 'WORKITEM':
        this.reorderWorkItem(draggableId, source, destination);
        break;
    }

    this.setState({
      dragType: '',
    });

    // console.log('onDragEnd: ', result);
  };

  onDragStart = (initial) => {
    // console.log('onDragStart: ', initial);

    this.setState({
      dragType: initial.type,
    });
  };

  renderNests() {
    const {
      boardId,
      company: {
        lastWorkspace,
      },
      dispatch,
      fields,
      nests,
      workItems,
    } = this.props;

    return (
      <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
        <NestsList
          boardId={boardId}
          dispatch={dispatch}
          dragType={this.state.dragType}
          fields={fields.data}
          nests={nests}
          workItems={workItems}
          workSpaceId={lastWorkspace}
        />
      </DragDropContext>
    );
  }

  renderAddNewNest() {
    return (
      <div className="container main">
        <div className="form-group" style={{width: '300px'}}>
          <input
            className="form-control"
            placeholder="Add new nest"
            type="text"
            value={this.state.newNestName}
            onChange={this.handleChangeOnAddNewNest}
            onKeyUp={this.handleKeyUpOnAddNewNest}
            autoComplete="off"
          />
        </div>
      </div>
    );
  }

  renderCurrentBoard() {
    const {
      boardId,
      currentBoard,
      dispatch,
    } = this.props;

    if (currentBoard && Object.keys(currentBoard).length) {
      return (
        <div className="board">
          {this.renderBoardTitleAndActionsContainer()}
          {this.renderNests()}
          {this.renderAddNewNest()}
        </div>
      );
    }

    return false;
  }

  render() {
    return (
      <div className="board-detailed">
        {/* board ribbon */}
        {this.renderBoardsList()}

        {/* current board info */}
        {/* {this.renderCurrentBoard()} */}
      </div>
    );
  }
}

BoardDetailed.defaultProps = {
  // currentBoard: {},
  // workItems: [],
};

BoardDetailed.propTypes = {
  boardId: PropTypes.string.isRequired,
  // board: PropTypes.object,
  // boards: PropTypes.object.isRequired,
  // company: PropTypes.object.isRequired,
  // currentBoard: PropTypes.object,
  dispatch: PropTypes.func,
  // fields: PropTypes.object,
  // nests: PropTypes.object,
  // workItems: PropTypes.object,
  // timestamp: PropTypes.number,
};

export default connect()(BoardDetailed);

// export default connect((state, props) => {
//   const boards = state.boards;
//   let currentBoard = {};

//   if (boards.data && boards.sorted) {
//     currentBoard = boards.data[props.boardId] || {};
//   }

//   return {
//     currentBoard,
//     boards,
//     board: state.board,
//     company: state.company,
//     fields: state.fields,
//     nests: state.nests,
//     workItems: state.workItems.data,
//     timestamp: state.workItems.timestamp,
//   };
// })(BoardDetailed);
