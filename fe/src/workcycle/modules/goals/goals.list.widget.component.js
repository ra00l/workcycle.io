import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {showDialog} from './../../modules/dialog/dialog.actions';

import Goal from '../goal/goal.component';
import CreateGoal from './goal/createGoalModal.component';

import {ContextMenu, MenuItem, ContextMenuTrigger} from 'react-contextmenu';

class GoalsListWidget extends Component {

  handleClickOnAddNewGoal = () => {
    const options = {
      closeCb: () => false,
      content: (
        <CreateGoal />
      ),
      className: 'create-goal-modal-container',
    };
    const buttons = [];

    this.props.dispatch(showDialog(options, buttons));
  }

  handleClickOnContextMenu = (e, data) => {
    const options = {
      closeCb: () => false,
      content: null,
    };
    const buttons = [];

    switch (data.type) {
      case 'goal':
        options.content = (
          <CreateGoal />
        );
        options.className = 'create-goal-modal-container';
        break;
    }

    this.props.dispatch(showDialog(options, buttons));
  }

  renderGoalCards() {
    const {
      goalsOrder,
    } = this.props;

    if (goalsOrder.size === 0) {
      return (
        <div className="add-your-goal" onClick={this.handleClickOnAddNewGoal}>
          <img src="/assets/images/no_goals.svg" />
          <h4>Add your goals here</h4>
        </div>
      );
    }

    const goalsMarkup = goalsOrder.map((goalId, index) => (
      <Goal key={index} goalId={goalId} />
    ));

    return goalsMarkup;
  }

  renderGoalsSection() {
    const {goalsOrder} = this.props;

    return (
      <div className="container main">
        <div className="section-title">
          <h4>Goals {goalsOrder.size > 0 ? `(${goalsOrder.size})` : false}</h4>
        </div>
        <div className="section-body">
          {this.renderGoalCards()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="goals-list">
        <ContextMenuTrigger id="goals_list_widget_context_menu">
          {this.renderGoalsSection()}
        </ContextMenuTrigger>

        <ContextMenu id="goals_list_widget_context_menu">
          <MenuItem data={{type: 'goal'}} onClick={this.handleClickOnContextMenu}>
            Goal
          </MenuItem>
        </ContextMenu>
      </div>
    );
  }
}

GoalsListWidget.propTypes = {
  goalsOrder: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  workspace: PropTypes.object.isRequired,
};

export default connect((state, props) => {
  const goalsStore = state.goals;
  const companyStore = state.company;
  const authStore = state.auth;

  const lastWorkspace = companyStore.lastWorkspace;
  const workspaceList = authStore.userInfo && authStore.userInfo.workspaceList || [];
  let workspace = {};

  workspaceList.map(item => {
    if (item.id === lastWorkspace) {
      workspace = item;
    }
  });

  return {
    goalsOrder: goalsStore.get('sorted'),
    workspace,
  };
})(GoalsListWidget);
