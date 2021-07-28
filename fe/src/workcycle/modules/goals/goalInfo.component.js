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
import BoardInfoTitle from './../boards/boardInfoTitle.component';
import NestsList from '../nests/nestsList.component';
import AddNest from '../nests/nestAdd.component';

class GoalInfo extends Component {

  componentWillMount() {
    const {
      goalId,
      dispatch,
    } = this.props;

    // get workitems
    dispatch(getBoardNestsAndWorkItems(goalId));
    this.showHideLoader(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {
      goalId,
      dispatch,
    } = nextProps;

    // get workitems
    dispatch(getBoardNestsAndWorkItems(goalId));
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
      goalId,
      dispatch,
    } = this.props;

    // the reorder of nest is possible only inside a board
    if (destination) {
      // dispatch(updateNest(goalId, nestId, {order: destination.index + 1}));
      dispatch(orderNest(goalId, nestId, {order: destination.index + 1}, destination.index));
    }
  }

  orderWorkItem(workItemId, fromSource, toDestination) {
    const {
      goalId,
      dispatch,
    } = this.props;

    // the reorder of workitem now possible only inside a board
    if (toDestination) {
      dispatch(orderWorkItem(goalId, workItemId, fromSource, toDestination));
    }
  }

  orderChildItem(childItemId, fromSource, toDestination) {
    const {
      goalId,
      dispatch,
    } = this.props;

    if (toDestination) {
      dispatch(orderChildWorkItem(goalId, childItemId, fromSource, toDestination));
    }
  }

  orderCustomField(fieldDescriptionId, fromSource, toDestination) {
    const {
      goalId,
      dispatch,
      workspaceId,
    } = this.props;
    // fieldDescriptionId = "DRAGGABLE_FIELD_{fieldId}_FROM_NEST_{nestId}"
    const field = fieldDescriptionId.split('DRAGGABLE_FIELD_');
    const [fieldId] = field[1].split('_FROM_NEST');

    if (toDestination) {
      dispatch(orderField(workspaceId, goalId, fieldId, {order: toDestination.index}, toDestination.index));
    }
  }

  renderBoardTittle() {
    const {
      goal,
      dispatch,
      workspaceId,
    } = this.props;

    return (
      <BoardInfoTitle
        board={goal}
        dispatch={dispatch}
        workspaceId={workspaceId}
        isGoal
      />
    );
  }

  rendederNestsList() {
    const {
      goalId,
      nestsOrder,
    } = this.props;

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <NestsList boardId={goalId} nestList={nestsOrder} isGoal />
      </DragDropContext>
    );
  }

  renderAddNest() {
    const {goalId} = this.props;

    return (
      <AddNest boardId={goalId} />
    );
  }

  render() {
    // TODO render children when we have item in url
    const {goal} = this.props;

    if (goal.size) {
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

GoalInfo.defaultProps = {
  nestsOrder: {},
};

GoalInfo.propTypes = {
  goalId: PropTypes.string.isRequired,
  goal: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isFetchingBoardData: PropTypes.bool.isRequired,
  nestsOrder: PropTypes.object,
  workspaceId: PropTypes.number.isRequired,
};

export default connect((state, props) => {
  const companyStore = state.company;
  const goalsStore = state.goals;
  const nestsStore = state.nests;
  const boardStore = state.board;
  const goal = goalsStore.getIn(['data', `${props.goalId}`]) || Map();
  const nestsOrder = nestsStore.get('sorted');
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;
  const isFetchingBoardData = boardStore.actionInProgress;

  return {
    goal,
    isFetchingBoardData,
    nestsOrder,
    workspaceId,
  };
})(GoalInfo);
