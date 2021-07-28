import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {browserHistory} from 'react-router';

// components
import WorkItemActions from './workItemActions.component';

class WorkItemTitle extends Component {

  handleClick = () => {
    // TODO: open workItem modal
    const {
      boardId,
      isGoal,
      workItem,
      workspaceId,
    } = this.props;

    if (isGoal) {
      browserHistory.push(`/${workspaceId}/goals/${boardId}/item/${workItem.get('id')}`);
    } else {
      browserHistory.push(`/${workspaceId}/boards/${boardId}/item/${workItem.get('id')}`);
    }
  };

  renderIcons() {
    const {workItem} = this.props;
    const hasComments = workItem.get('comment') > 0;
    const hasFiles = workItem.get('file') > 0;
    const hasUnreadComments = false;
    // TODO: implement logic to see the current workitem has the comments enabled and the user has some

    const classString = classnames('field-title-comments', {
      'field-title-comments-unread': hasUnreadComments,
    });

    if (hasComments || hasFiles) {
      return (
        <span className={classString}>
          {hasComments ? <i className="far fa-comment" /> : ''}
          {hasFiles ? <i className="far fa-file" /> : ''}
        </span>
      );
    }

    return false;
  }

  renderActions() {
    const {
      boardId,
      dispatch,
      workItem,
      isGoal,
      workspaceId,
    } = this.props;

    return (
      <WorkItemActions
        boardId={boardId}
        dispatch={dispatch}
        isGoal={isGoal}
        workItem={workItem}
        workspaceId={workspaceId}
      />
    );
  }

  render() {
    const {workItem} = this.props;

    const classString = classnames('field-title workitem-field', {
      // 'workitem-row-item': add-new-work-item > 0,
      // 'workitem-row-item-title--is-child': idParent,
    });

    return (
      <div className={classString}>
        <div className="field-title-container">
          <div className="field-title-text" onClick={this.handleClick}>
            <span>{workItem.get('title')}</span>
          </div>
          <div className="field-title-actions">
            {this.renderIcons()}
            {this.renderActions()}
          </div>
        </div>
      </div>
    );
  }
}

WorkItemTitle.defaultProps = {
  isGoal: false,
};

WorkItemTitle.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  isGoal: PropTypes.bool,
  workItem: PropTypes.object.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

export default WorkItemTitle;
