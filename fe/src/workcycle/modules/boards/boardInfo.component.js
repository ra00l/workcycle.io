import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import util from '../../services/browser.util.service';

// actions
import {getBoardNestsAndWorkItems} from './../boards/board/board.actions';
import {hideLoader, showLoader} from '../loader/loader.actions';
import {
  // createNest,
  orderNest,
  // updateNest,
  // reorderWorkItemInNest,
} from './../nests/nests.actions';
import {
  orderWorkItem,
  orderChildWorkItem,
} from './../workItems/workItems.actions';
import {orderField} from './../fields/fields.actions';

// components
import {DragDropContext} from 'react-beautiful-dnd';
import BoardInfoTitle from './boardInfoTitle.component';
import NestsList from '../nests/nestsList.component';
import AddNest from '../nests/nestAdd.component';

class BoardInfo extends Component {

  componentWillMount() {
    const {
      boardId,
      dispatch,
    } = this.props;

    // get workitems
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
      dispatch,
      isFetchingBoardData,
    } = props;

    if (isFetchingBoardData) {
      dispatch(showLoader());
    } else {
      dispatch(hideLoader());
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
        this.orderNest(draggableId, destination);
        break;
      case 'WORKITEM':
        this.orderWorkItem(draggableId, source, destination);
        break;
      case 'FIELD':
        this.orderCustomField(draggableId, source, destination);
        break;
    }

    // drag and drop child items
    if (type.indexOf('WORKITEM-CHILD-LEVEL') !== -1) {
      // drag and drop child items
      this.orderChildItem(draggableId, source, destination);
    }

    // console.log('onDragEnd: ', result);
  };

  orderNest(nestId, destination) {
    const {
      boardId,
      dispatch,
    } = this.props;

    // the reorder of nest is possible only inside a board
    if (destination) {
      // dispatch(updateNest(boardId, nestId, {order: destination.index + 1}));
      dispatch(orderNest(boardId, nestId, {order: destination.index + 1}, destination.index));
    }
  }

  orderWorkItem(workItemId, fromSource, toDestination) {
    const {
      boardId,
      dispatch,
    } = this.props;

    // the reorder of workitem now possible only inside a board
    if (toDestination) {
      dispatch(orderWorkItem(boardId, workItemId, fromSource, toDestination));
    }
  }

  orderChildItem(childItemId, fromSource, toDestination) {
    const {
      boardId,
      dispatch,
    } = this.props;

    if (toDestination) {
      dispatch(orderChildWorkItem(boardId, childItemId, fromSource, toDestination));
    }
  }

  orderCustomField(fieldDescriptionId, fromSource, toDestination) {
    const {
      boardId,
      dispatch,
      workspaceId,
    } = this.props;
    // fieldDescriptionId = "DRAGGABLE_FIELD_{fieldId}_FROM_NEST_{nestId}"
    const field = fieldDescriptionId.split('DRAGGABLE_FIELD_');
    const [fieldId] = field[1].split('_FROM_NEST');

    if (toDestination) {
      dispatch(orderField(workspaceId, boardId, fieldId, {order: toDestination.index - 1}, toDestination.index));
    }
  }

  renderBoardTittle() {
    const {
      board,
      dispatch,
      workspaceId,
    } = this.props;

    return (
      <BoardInfoTitle
        board={board}
        dispatch={dispatch}
        workspaceId={workspaceId}
      />
    );
  }

  rendederNestsList() {
    const {
      boardId,
      nestsOrder,
      boardFilter,
    } = this.props;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <NestsList boardId={boardId} nestList={nestsOrder} boardFilter={boardFilter} />
      </DragDropContext>
    );
  }

  renderAddNest() {
    const {boardId} = this.props;

    return (
      <AddNest boardId={boardId} />
    );
  }

  render() {
    // TODO render children when we have item in url
    const {board} = this.props;

    if (board.size) {
      return (
        <div className="board">
          {this.renderBoardTittle()}
          {this.rendederNestsList()}
          {this.renderAddNest()}
        </div>
      );
    }

    return false;
  }
}

BoardInfo.defaultProps = {
  nestsOrder: {},
};

BoardInfo.propTypes = {
  boardId: PropTypes.string.isRequired,
  board: PropTypes.object.isRequired,
  boardFilter: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isFetchingBoardData: PropTypes.bool.isRequired,
  nestsOrder: PropTypes.object,
  workspaceId: PropTypes.number.isRequired,
};

export default connect((state, props) => {
  const companyStore = state.company;
  const boardsStore = state.boards;
  const nestsStore = state.nests;
  const boardStore = state.board;
  const board = boardsStore.getIn(['data', `${props.boardId}`]) || Map();
  const nestsOrder = nestsStore.get('sorted');
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;
  const isFetchingBoardData = boardStore.actionInProgress;
  const boardFilter = state.boardFilter.get('data');

  return {
    board,
    boardFilter,
    isFetchingBoardData,
    nestsOrder,
    workspaceId,
  };
})(BoardInfo);
