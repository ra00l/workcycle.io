import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';

// actions
import {getGoals} from './goals.actions';
import {showDialog} from './../dialog/dialog.actions';
import {invalidateWorkItem} from './../workItems/workItem.actions';

// components
import GoalsList from './goals.list.component';
import GoalInfo from './goalInfo.component';
import WorkItemModal from './../workItems/workItem/modal/workItemModal.component';

import Dialog from 'material-ui/Dialog';

class GoalLandingPage extends Component {

  state = {
    showWorkItemModal: false,
  }

  componentWillMount() {
    const {
      company: {
        lastWorkspace,
      },
      params: {
        goalId,
        itemId,
      },
    } = this.props;

    this.props.dispatch(getGoals(lastWorkspace));

    if (goalId && itemId) {
      this.showWorkItemModal();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      params: {
        goalId,
        itemId,
      },
    } = nextProps;

    if (goalId && itemId) {
      this.showWorkItemModal();
    }
  }

  showWorkItemModal() {
    this.setState({
      showWorkItemModal: true,
    });
  }

  closeWorkItemModal = () => {
    const {
      dispatch,
      params: {
        goalId,
        workspaceId,
      },
    } = this.props;

    // invalidate workItem store
    dispatch(invalidateWorkItem());

    this.setState({
      showWorkItemModal: false,
    });

    browserHistory.push(`/${workspaceId}/goals/${goalId}`);
  }

  closeModal = () => {
    const {
      params: {
        goalId,
        workspaceId,
      },
    } = this.props;

    this.setState({
      showWorkItemModal: false,
    });

    browserHistory.push(`/${workspaceId}/goals/${goalId}`);
  }

  renderWorkItemModal() {
    const {
      dispatch,
      params: {
        goalId,
        itemId,
        workspaceId,
      },
    } = this.props;

    if (goalId && itemId) {
      return (
        <Dialog
          modal={false}
          open={this.state.showWorkItemModal}
          onRequestClose={this.closeWorkItemModal}
          className="workItem-material-modal"
          autoScrollBodyContent={true}
          contentStyle={{transform: 'translate(0px, 0px)'}}
        >
          <WorkItemModal
            boardId={goalId}
            workItemId={itemId}
            isGoal={true}
            workspaceId={workspaceId}
            closeModal={this.closeModal}
          />
        </Dialog>
      );
    }

    return false;
  }

  render() {
    const {
      company: {
        lastWorkspace,
      },
      dispatch,
      params: {
        goalId,
      },
    } = this.props;

    // TODO render children when we have item in url

    return (
      <div className="board-detailed">
        <GoalsList goalId={goalId} />
        <GoalInfo goalId={goalId} />

        {this.renderWorkItemModal()}
      </div>
    );
  }
}

GoalLandingPage.propTypes = {
  children: PropTypes.node,
  company: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

export default connect((state) => ({
  company: state.company,
}))(GoalLandingPage);
