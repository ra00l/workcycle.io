import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import {browserHistory} from 'react-router';

// services
import l10nService from './../../../l10n/l10n.service';

// actions
import {getWorkItem} from './../../workItem.actions';

// components
import WorkItemActions from './../workItemActions.component';
import WorkItemInfoTab from './workItemInfoTab.component';
import WorkItemUpdatesTab from './workItemUpdatesTab.component';
import WorkItemFilesTab from './workItemFilesTab.component';

const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate workitem name
  if (!values.workitemName) {
    errors.workitemName = REQUIRED;
  }

  return errors;
};

class WorkItemModal extends Component {

  state = {
    visibleTab: 'info',
  }

  componentWillMount() {
    const {
      boardId,
      dispatch,
      workItemId,
    } = this.props;

    dispatch(getWorkItem(boardId, workItemId));
  }

  onDeleteWorkItem = () => {
    const {
      boardId,
      isGoal,
      workspaceId,
    } = this.props;

    if (isGoal) {
      browserHistory.push(`/${workspaceId}/goals/${boardId}`);
    } else {
      browserHistory.push(`/${workspaceId}/boards/${boardId}`);
    }
  }

  closeHandler = () => {
    this.props.closeModal();
  }

  renderTitle() {
    const {visibleTab} = this.state;
    const {
      boardId,
      dispatch,
      isGoal,
      workItem,
      workspaceId,
    } = this.props;

    const updatesClass = classnames('tab', {
      'tab-selected': visibleTab === 'updates',
    });

    const infoClass = classnames('tab', {
      'tab-selected': visibleTab === 'info',
    });

    const filesClass = classnames('tab', {
      'tab-selected': visibleTab === 'files',
    });

    const numberOfFiles = workItem.get('file').size || 0;
    const numberOfComments = workItem.get('comment').size || 0;

    return (
      <div className="board-header">
        <h3 className="text--bold">
          {l10nService.translate('WORKITEMS.WORKITEM.TITLE')}
          <span>
            <WorkItemActions
              boardId={boardId}
              dispatch={dispatch}
              workItem={workItem}
              isGoal={isGoal}
              deleteHandler={this.onDeleteWorkItem}
              workspaceId={workspaceId}
            />
          </span>
        </h3>
        <div className="flex-center-space-evenly">
          <div className="tabs">
            <span className={filesClass} onClick={() => this.setState({visibleTab: 'files'})}>
              FILES ({numberOfFiles})
            </span>
            <span className={updatesClass} onClick={() => this.setState({visibleTab: 'updates'})}>
              UPDATES ({numberOfComments})
            </span>
            <span className={infoClass} onClick={() => this.setState({visibleTab: 'info'})}>
              INFO
            </span>
          </div>
        </div>
        <i onClick={this.closeHandler} className="fa fa-times" />
      </div>
    );
  }

  renderInfoTab() {
    const {
      boardId,
      dispatch,
      isGoal,
      workItem,
      workspaceId,
    } = this.props;

    if (this.state.visibleTab === 'info') {
      return (
        <WorkItemInfoTab
          boardId={boardId}
          dispatch={dispatch}
          isGoal={isGoal}
          workItem={workItem}
          workspaceId={workspaceId}
        />
      );
    }

    return false;
  }

  renderUpdatesTab() {
    const {
      boardId,
      dispatch,
      workItem,
      workItemId,
    } = this.props;

    if (this.state.visibleTab === 'updates') {
      return (
        <WorkItemUpdatesTab
          boardId={boardId}
          dispatch={dispatch}
          workItem={workItem}
          workItemId={workItemId}
        />
      );
    }
    
    return false;
  }

  renderFilesTab() {
    const {
      boardId,
      dispatch,
      workItem,
      workItemId,
    } = this.props;

    if (this.state.visibleTab === 'files') {
      return (
        <WorkItemFilesTab
          boardId={boardId}
          dispatch={dispatch}
          workItem={workItem}
          workItemId={workItemId}
        />
      );
    }
    
    return false;
  }

  render() {
    const {
      actionInProgress,
      workItem,
    } = this.props;

    if (workItem.size > 0) {
      return (
        <div className="workitem-create">
          {this.renderTitle()}
          {this.renderInfoTab()}
          {this.renderUpdatesTab()}
          {this.renderFilesTab()}
        </div>
      );
    }

    return false;
  }
}

WorkItemModal.defaultProps = {
  isGoal: false,
};

WorkItemModal.propTypes = {
  actionInProgress: PropTypes.bool.isRequired,
  boardId: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  isGoal: PropTypes.bool,
  workItem: PropTypes.object.isRequired,
  workItemId: PropTypes.string.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

export default connect((state, props) => {
  const workItemStore = state.workItem;
  const actionInProgress = workItemStore.get('actionInProgress');
  const workItem = workItemStore.getIn(['data', `${props.workItemId}`]) || Map();

  return {
    actionInProgress,
    workItem,
  };
})(WorkItemModal);
