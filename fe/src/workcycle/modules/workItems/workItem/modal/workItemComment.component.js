import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import editorService from '../../../common/editor.service';
import moment from 'moment';
import {Map, fromJS} from 'immutable';

import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {Editor} from 'react-draft-wysiwyg';
import Button from './../../../../components/button/button.component';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import FileThumbnail from './fileThumbnail.component';
import Dropzone from 'react-dropzone';

import Avatar from 'material-ui/Avatar';

import {COLOR_ARRAY} from './../../../../contants/colors.constants';
import WorkcycleEditor from '../../../common/editor.component';
import {renderUserIcon} from '../../../users/user.helper';

class WorkItemComment extends Component {

  state = {
    editMode: false,
    files: [],
    filesToBeUploaded: [],
    lastId: 0,
    editorState: null,
  }

  componentWillMount() {
    this.setEditor();
  }

  setEditor = () => {
    this.setState({
      editMode: false,
    });

  }

  handleOnItemClick = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;

    const html = this.props.comment.get('comment') || '<p></p>';

    switch (value) {
      case 'EDIT':
        this.setState({editMode: true, editorState: editorService.getState(html)});
        break;
      case 'DELETE':

        this.deleteComment();
        break;
    }
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  updateComment = () => {
    this.props.updateCommentHandler(
      this.props.comment.get('id'),
      this.state.editorState.getCurrentContent(),
      [...this.props.comment.get('files'), ...this.state.filesToBeUploaded]
    );
    this.setState({
      editMode: false,
    });
  }

  deleteComment() {
    this.props.removeCommentHandler(this.props.comment.get('id'));
  }

  formatDate(dateToFormat) {
    const momentDate = moment(dateToFormat);
    const today = moment();
    let commentDate = momentDate.format('DD.MM.YYYY'); // todo: extract to config variables!
    const commentHour = momentDate.format('HH:mm');

    if (momentDate.date() === today.date()) {
      commentDate = 'Today';
    }

    return `${commentDate} at ${commentHour}`;
  }

  getUser() {
    const {
      comment,
      users,
    } = this.props;

    let user = Map();

    users.map(item => {
      if (item.get('id') === comment.get('createdBy')) {
        user = item;
      }
    });

    return user;
  }

  removeFileFromAComment = (fileId) => {
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

  deleteFileFromComment = (fileId) => {
    const {
      comment,
      deleteFile,
    } = this.props;

    deleteFile(comment.get('id'), fileId);
  }

  renderIcon() {
    const {
      comment,
      loggedInUser,
    } = this.props;

    if (comment.get('createdBy') !== loggedInUser.id) return;

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
        onItemClick={this.handleOnItemClick}
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
      >
        <MenuItem value="EDIT" primaryText="Edit"/>
        <MenuItem value="DELETE" primaryText="Delete"/>
      </IconMenu>
    );
  }

  droppedFiles = (files) => {
    const fileToBeAddedToState = [];
    let lastId = this.state.lastId;

    files.forEach(file => {
      fileToBeAddedToState.push({
        id: lastId,
        new: true,
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

  renderCommentFiles() {
    const {
      comment,
      loggedInUser,
    } = this.props;

    const files = comment.get('files');
    const stateFiles = fromJS(this.state.files);

    const canDeleteFile = comment.get('createdBy') === loggedInUser.id;

    if (files.size > 0) {
      return (
        <div className="workitem-updates-section__comments__comment__files">
          {files.map((file, index) => (
            <FileThumbnail
              key={index}
              file={file}
              deleteFile={this.deleteFileFromComment}
              showDelete={canDeleteFile}
            />
          ))}

          {stateFiles.map((file, index) => (
            <FileThumbnail
              key={index}
              file={file}
              deleteFile={this.removeFileFromAComment}
            />
          ))}
        </div>
      );
    }
  }

  renderViewState() {
    const {
      comment,
      loggedInUser,
    } = this.props;
    const user = this.getUser();

    const byCurrentUser = comment.get('createdBy') === loggedInUser.id;

    if (!this.state.editMode) {
      return (
        <Card>
          <CardHeader
            title={user.get('name')}
            subtitle={this.formatDate(comment.get('createdAt'))}
            avatar={renderUserIcon(user.get('name'), user.get('img'))}
            openIcon={this.renderIcon()}
            closeIcon={this.renderIcon()}
            iconStyle={{top: '-16px', right: '16px'}}
            showExpandableButton={byCurrentUser}
          />
          <CardText>
            <div className="comment-text" dangerouslySetInnerHTML={{__html: comment.get('comment')}}/>
            {this.renderCommentFiles()}
          </CardText>
        </Card>
      );
    }

    return false;
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
      textAlign: 'center',
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

  editorStateChanged(editorState) {
    this.setState({editorState: editorState});
  }

  renderEditComment() {
    if (this.state.editMode) {
      return (
        <div className="add-new-comment-wrapper">
          <WorkcycleEditor editorState={this.state.editorState} onChange={this.editorStateChanged.bind(this)} />
          {this.renderCommentFiles()}
          <div className="actions text-right flex">
            {this.renderUploadDropzone()}
            <Button
              label="Cancel"
              onClick={this.setEditor}
              type="link"
            />
            <Button
              label="Update"
              onClick={this.updateComment}
              type="primary"
            />
          </div>
        </div>
      );
    }

    return false;
  }

  render() {
    return (
      <div className="workitem-updates-section__comments__comment">
        {this.renderViewState()}
        {this.renderEditComment()}
      </div>
    );
  }
}

WorkItemComment.defaultProps = {};

WorkItemComment.propTypes = {
  comment: PropTypes.object.isRequired,
  removeCommentHandler: PropTypes.func.isRequired,
  updateCommentHandler: PropTypes.func.isRequired,
  deleteFile: PropTypes.func.isRequired,
  users: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object,
};

export default connect((state, props) => {
  const authStore = state.auth;
  const loggedInUser = authStore && authStore.userInfo && authStore.userInfo;

  return {
    loggedInUser,
  };
})(WorkItemComment);
