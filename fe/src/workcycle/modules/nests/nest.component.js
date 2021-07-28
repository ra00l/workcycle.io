import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';
import {Map} from 'immutable';

// components
import WorkItemsList from '../workItems/workItems.list.component';
import NestTitle from './nestTitle.component';
import FieldsList from '../fields/fields.list.component';
import AddWorkItem from './../workItems/workItemAdd.component';
import {Droppable} from 'react-beautiful-dnd';

class Nest extends Component {

  static setLocalStorageState(boardId, nestId, state) {
    const storageNestState = JSON.parse(localStorage['nest-collapse-state']);

    if (!storageNestState[boardId]) {
      storageNestState[boardId] = {};
    }

    if (!state) {
      storageNestState[boardId][nestId] = true;
    } else {
      delete storageNestState[boardId][nestId];
    }

    localStorage['nest-collapse-state'] = JSON.stringify(storageNestState);
  }

  static getLocalStorageState(boardId, nestId) {
    if (!localStorage['nest-collapse-state']) {
      localStorage['nest-collapse-state'] = '{}';
    }
    const storageNestState = JSON.parse(localStorage['nest-collapse-state']);
    if (!storageNestState[boardId]) {
      storageNestState[boardId] = {};
    }

    return storageNestState[boardId][nestId] || false;
  }

  state = {
    collapsed: false,
  };

  componentWillMount() {
    const {
      boardId,
      nestId,
    } = this.props;

    const state = Nest.getLocalStorageState(boardId, nestId);

    if (state) {
      this.setState({
        collapsed: true,
      });
    }
  }

  handleClickOnCollapse = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });

    const {
      boardId,
      nestId,
    } = this.props;

    Nest.setLocalStorageState(boardId, nestId, this.state.collapsed);
  }

  renderNestTitle() {
    const {
      boardId,
      dispatch,
      nest,
    } = this.props;
    return (
      <NestTitle
        boardId={boardId}
        dispatch={dispatch}
        handleCollapse={this.handleClickOnCollapse}
        nest={nest}
        collapsed={this.state.collapsed}
      />
    );
  }

  renderFieldList() {
    const {collapsed} = this.state;
    const {
      boardId,
      nestId,
    } = this.props;

    if (!collapsed) {
      return (
        <FieldsList boardId={boardId} nestId={nestId}/>
      );
    }

    return false;
  }

  renderWorkItemsList() {
    const {
      boardId,
      nest,
      nestId,
      isGoal,
    } = this.props;
    const {collapsed} = this.state;
    const listOfIds = nest.get('sortedWorkItems');
    const droppableId = `${nestId}`;

    if (!collapsed) {
      return (
        <Droppable droppableId={droppableId} type="WORKITEM">
          {
            (provided, snapshot) => (
              <div ref={provided.innerRef}>
                <WorkItemsList
                  boardId={boardId}
                  itemsIds={listOfIds}
                  isGoal={isGoal}
                />
                {this.renderAddNewWorkItem()}
              </div>
            )
          }
        </Droppable>
      );
    }

    return false;
  }

  renderAddNewWorkItem() {
    const {
      boardId,
      isGoal,
      nestId,
    } = this.props;

    return (
      <AddWorkItem boardId={boardId} nestId={nestId} isGoal={isGoal} />
    );
  }

  render() {
    const {index} = this.props;
    const classString = classnames('nest container white', {
      'first-nest-of-the-board': index === 0,
    });

    return (
      <div className={classString}>
        {this.renderNestTitle()}
        {this.renderFieldList()}
        {this.renderWorkItemsList()}
      </div>
    );
  }
}

Nest.defaultProps = {
  isGoal: false,
};

Nest.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  nest: PropTypes.object.isRequired,
  nestId: PropTypes.number.isRequired,
  workspaceId: PropTypes.number.isRequired,
  isGoal: PropTypes.bool,
};

export default connect((state, props) => {
  const companyStore = state.company;
  const nestsStore = state.nests;

  const nest = nestsStore.getIn(['data', `${props.nestId}`]) || Map();
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;

  return {
    nest,
    workspaceId,
  };
})(Nest);
