import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Map, fromJS} from 'immutable';

import {
  addComment,
  updateComment,
  removeComment,
  removeFileFromComment,
} from './../../workItem.actions';

import editorService from '../../../common/editor.service';

import {Editor} from 'react-draft-wysiwyg';
import WorkItemCommentsList from './workItemCommentsList.component';
import Button from './../../../../components/button/button.component';
import Dropzone from 'react-dropzone';
import FileThumbnail from './fileThumbnail.component';
import WorkcycleEditor from '../../../common/editor.component';

import InputField from './../../../../components/form/inputField/inputField.component';
import {addDangerAlert} from '../../../alerts/alert.actions';

class WorkItemUpdatesSection extends Component {

  state = {
    files: [],
    filesToBeUploaded: [],
    lastId: 0,
    editorState: editorService.getState(null),
    isAddingComment: false,
  };

  editorStateChanged(editorState) {
    this.setState({editorState: editorState});
  }

  addNewComment = () => {
    const {
      boardId,
      users,
      dispatch,
      workItemId,
      loggedInUsername,
    } = this.props;

    const editorContent = this.state.editorState.getCurrentContent();
    const commentMeta = editorService.getEditorData(editorContent, users);

    if (this.state.filesToBeUploaded.length === 0 && !editorContent.hasText()) {
      return dispatch(addDangerAlert('Please add a file or write your comment!'));
    }

    const commentData = new FormData();
    this.state.filesToBeUploaded.forEach(file => {
      commentData.append('file', file);
    });
    commentData.append('comment', commentMeta.html);
    commentData.append('mentions', commentMeta.mentions);


    let currentUser = Map();
    users.map(user => {
      if (user.get('name') === loggedInUsername) {
        currentUser = user;
      }
    });

    this.setState({isAddingComment: true});

    dispatch(addComment(boardId, workItemId, commentData, currentUser.get('id'), () => {
      this.setState({
        editorState: editorService.getState(null),
        files: [],
        filesToBeUploaded: [],
        lastId: 0,
        isAddingComment: false,
      });
    }));
  };

  updateComment = (commentId, editorContent, files = []) => {
    const {
      boardId,
      dispatch,
      users,
      workItemId,
    } = this.props;

    const commentMeta = editorService.getEditorData(editorContent, users);

    const commentData = new FormData();
    files.forEach(file => {
      commentData.append('file', file);
    });
    commentData.append('comment', commentMeta.html);
    commentData.append('mentions', commentMeta.mentions);

    dispatch(updateComment(boardId, workItemId, commentId, commentData));
  }

  removeComment = (commentId) => {
    const {
      boardId,
      dispatch,
      workItemId,
    } = this.props;

    dispatch(removeComment(boardId, workItemId, commentId));
  }

  removeFile = (commentId, fileId) => {
    const {
      boardId,
      dispatch,
      workItemId,
    } = this.props;

    dispatch(removeFileFromComment(boardId, workItemId, commentId, fileId));
  }

  droppedFiles = (files) => {
    const fileToBeAddedToState = [];
    const filesToBeUploaded = [];
    let lastId = this.state.lastId;

    files.forEach(file => {
      fileToBeAddedToState.push({
        id: lastId,
        name: file.name,
        url: file.preview,
        fileHandle: file,
      });

      lastId = lastId + 1;
    });

    this.setState({
      files: [...this.state.files, ...fileToBeAddedToState],
      filesToBeUploaded: [...this.state.filesToBeUploaded, ...files],
      lastId: lastId,
    });
  }

  removeFileFromAddNewComment = (fileId) => {
    const currentListOfFiles = this.state.files;
    const newArrayOfFiles = currentListOfFiles.filter(obj => obj.id !== fileId);
    const currentListOfFileThatWillBeUploaded = this.state.filesToBeUploaded;
    currentListOfFileThatWillBeUploaded.splice(fileId, 1);

    this.setState({
      lastId: this.state.lastId - 1,
      files: newArrayOfFiles,
      filesToBeUploaded: currentListOfFileThatWillBeUploaded,
    });
  }

  renderUploadDropzone() {
    const styles = {
      width: '100%',
      height: '50px',
      borderWidth: '1px',
      borderColor: 'rgb(102, 102, 102)',
      borderStyle: 'dashed',
      borderRadius: '5px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
    };

    const activeStyles = {
      borderColor: 'green',
      background: 'rgba(128, 128, 128, 0.2)',
    };

    return (
      <div className="flex-1">
        <Dropzone
          onDrop={this.droppedFiles}
          style={styles}
          activeStyle={activeStyles}
          multiple={true}
          className="upload-file-on-comment"
        >
          <p>Drop files here or click to select files to upload.</p>
        </Dropzone>
      </div>
    );
  }

  renderFiles() {
    const files = fromJS(this.state.files);

    if (files.size > 0) {
      return (
        <div className="workitem-updates-section__comments__comment__files">
          {files.map((file, index) => (
            <FileThumbnail
              key={index}
              file={file}
              deleteFile={this.removeFileFromAddNewComment}
            />
          ))}
        </div>
      );
    }
  }

  renderAddNewComment() {
    return (
      <div className="add-new-comment-wrapper">
        <WorkcycleEditor editorState={this.state.editorState} onChange={this.editorStateChanged.bind(this)} />

        {this.renderFiles()}

        <div className="actions text-right flex">
          {this.renderUploadDropzone()}
          <Button
            label="Add"
            onClick={this.addNewComment}
            type="primary"
            disabled={this.state.isAddingComment}
          />
        </div>
      </div>
    );
  }

  renderComments() {
    const {
      users,
      workItem,
    } = this.props;

    return (
      <WorkItemCommentsList
        comments={workItem.get('comment')}
        removeCommentHandler={this.removeComment}
        updateCommentHandler={this.updateComment}
        deleteFileHandler={this.removeFile}
        users={users}
      />
    );
  }

  renderWorkItemTitle() {
    const {workItem} = this.props;

    return (
      <InputField
        input={{
          name: 'workitemName',
          value: workItem.get('title'),
        }}
        name="workitemName"
        disabled={true}
        type="text"
        placeholder="FORM.PLACEHOLDER.WORKITEM_DESCRIPTION"
        meta={{}}
      />
    );
  }

  render() {
    return (
      <div className="workitem-updates-section">
        {this.renderWorkItemTitle()}
        {this.renderAddNewComment()}
        <div>
          {this.renderComments()}
        </div>
      </div>
    );
  }
}

WorkItemUpdatesSection.defaultProps = {};

WorkItemUpdatesSection.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  loggedInUsername: PropTypes.string.isRequired,
  workItem: PropTypes.object.isRequired,
  workItemId: PropTypes.string.isRequired,
  users: PropTypes.object.isRequired,
};

export default connect((state, props) => {
  const usersStore = state.users;
  const authStore = state.auth;
  const users = usersStore.get('data');
  const loggedInUsername = authStore && authStore.userInfo && authStore.userInfo.name || '';

  return {
    loggedInUsername,
    users,
  };
})(WorkItemUpdatesSection);
