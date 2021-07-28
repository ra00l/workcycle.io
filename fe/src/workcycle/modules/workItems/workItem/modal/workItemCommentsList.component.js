import React, {Component} from 'react';
import PropTypes from 'prop-types';

import WorkItemComment from './workItemComment.component';

class WorkItemCommentsList extends Component {

  renderComments() {
    const {
      comments,
      users,
      removeCommentHandler,
      updateCommentHandler,
      deleteFileHandler,
    } = this.props;
    const commentsMarkup = comments.map((comment, index) => {
      const key = `COMMENT_${comment.get('id')}_${index}`;

      return (
        <div key={key}>
          <WorkItemComment
            comment={comment}
            removeCommentHandler={removeCommentHandler}
            updateCommentHandler={updateCommentHandler}
            deleteFile={deleteFileHandler}
            users={users}
          />
        </div>
      );
    });

    return commentsMarkup;
  }

  render() {
    return (
      <div className="workitem-updates-section__comments">
        {this.renderComments()}
      </div>
    );
  }
}

WorkItemCommentsList.defaultProps = {};

WorkItemCommentsList.propTypes = {
  comments: PropTypes.object.isRequired,
  removeCommentHandler: PropTypes.func.isRequired,
  updateCommentHandler: PropTypes.func.isRequired,
  deleteFileHandler: PropTypes.func.isRequired,
  users: PropTypes.object.isRequired,
};

export default WorkItemCommentsList;
