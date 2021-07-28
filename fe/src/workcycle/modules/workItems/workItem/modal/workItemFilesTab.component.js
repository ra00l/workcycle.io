import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import Dropzone from 'react-dropzone';


import workItemService from './../workItem.service';
import {addDangerAlert} from './../../../alerts/alert.actions';
import {
  addFileToTheItem,
  deleteFileFromItem,
} from './../../workItem.actions';

import FileThumbnail from './fileThumbnail.component';
import InputField from './../../../../components/form/inputField/inputField.component';

class WorkItemFilesSection extends Component {

  droppedFiles = (files) => {
    const {
      boardId,
      dispatch,
      workItemId,
    } = this.props;

    const [file] = files;
    const data = new FormData();
    data.append('file', file);

    workItemService.uploadFileForItem(boardId, workItemId, data)
      .then(response => {
        for (const file of response) {
          const item = {
            ...file,
          };

          dispatch(addFileToTheItem(workItemId, item));
        }
      })
      .catch(err => {
        dispatch(
          addDangerAlert(
            'Something went wrong with your upload. Make sure that your file is not ' +
            'corrupted and it is an image, .doc, .xls or bigger then "TBC" MB. Try again in a couple of minutes.')
        );
      });
  }

  deleteFileFromItem = (fileId) => {
    const {
      boardId,
      dispatch,
      workItemId,
    } = this.props;

    dispatch(deleteFileFromItem(boardId, workItemId, fileId));
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

  renderUploadDropzone() {
    const styles = {
      width: '100%',
      height: '100px',
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
      <div>
        <Dropzone onDrop={this.droppedFiles} style={styles} activeStyle={activeStyles} multiple={false}>
          <p>Drop files here or click to select files to upload.</p>
        </Dropzone>
      </div>
    );
  }

  renderFiles() {
    const {
      workItem,
      loggedInUser,
    } = this.props;

    const files = workItem.get('file');

    return (
      <div className="list-of-files">
        {files.map((file, index) => (
          <FileThumbnail
            key={index}
            file={file}
            deleteFile={this.deleteFileFromItem}
            showDelete={file.get('createdBy') === loggedInUser.id}
          />
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className="workitem-files-section">
        {this.renderWorkItemTitle()}
        {this.renderUploadDropzone()}
        {this.renderFiles()}
      </div>
    );
  }
}

WorkItemFilesSection.defaultProps = {};

WorkItemFilesSection.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  loggedInUsername: PropTypes.string.isRequired,
  loggedInUser: PropTypes.object.isRequired,
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
    loggedInUser: authStore && authStore.userInfo,
    users,
  };
})(WorkItemFilesSection);
