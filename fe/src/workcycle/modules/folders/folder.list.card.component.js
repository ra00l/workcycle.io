import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import classnames from 'classnames';
import {connect} from 'react-redux';

import {
  showConfirmationDialog,
} from '../dialog/dialog.actions';

import {
  removeFolder,
  moveFolder,
  renameFolder,
} from './folders.actions';
import foldersService from './folders.service';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MoveToFolder from './moveToFolder.component';
import RenameFolder from './folder.rename.component';

import Dialog from 'material-ui/Dialog';

class FolderListCard extends Component {

  state = {
    showModal: false,
    showRenameFolder: false,
    showDeleteModal: false,
  }

  closeModal = () => {
    this.setState({
      showModal: false,
      showRenameFolder: false,
    });
  }

  remove = () => {
    const {
      folderData,
      dispatch,
      folderId,
      workspaceId,
    } = this.props;

    const folderParentId = folderData.get('idParent');

    foldersService.removeFolder(workspaceId, folderId)
      .then(response => {
        dispatch(removeFolder(folderId, folderParentId));
      })
      .catch(err => {
        // TODO: alert something went wrong
      });
  }

  removeFolder = () => {
    const folderName = this.props.folderData.get('name');

    const options = {
      closeCb: () => false,
      content: (
        <div>
          <h4 className="confirmation-message">Delete folder</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following folder
            <span className="text--italic"> {folderName}</span> ?
            Please be aware that everything will be lost and you can't undo this action.
          </p>
        </div>
      ),
    };
    const buttons = {
      clickCb: this.remove,
      label: 'Delete',
    };

    this.props.dispatch(showConfirmationDialog(options, buttons));
  }

  moveFolder = (toFolder) => {
    const {
      folderId,
      workspaceId,
      folderData,
      dispatch,
    } = this.props;

    const fromFolder = folderData.get('idParent');

    foldersService.updateFolder(workspaceId, folderId, {
      idParent: toFolder,
    })
      .then(response => {
        dispatch(moveFolder(folderId, toFolder, fromFolder));

        this.setState({
          showModal: false,
        });
      })
      .catch(err => {
        // TODO: alert something went wrong
        this.setState({
          showModal: false,
        });
      });
  }

  renameFolder = (newName) => {
    const {
      folderId,
      workspaceId,
      dispatch,
    } = this.props;

    foldersService.updateFolder(workspaceId, folderId, {
      name: newName,
    })
      .then(response => {
        dispatch(renameFolder(folderId, newName));

        this.setState({
          showRenameFolder: false,
        });
      })
      .catch(err => {
        // TODO: alert something went wrong
        this.setState({
          showRenameFolder: false,
        });
      });
  }

  moveToFolder() {
    this.setState({
      showModal: true,
    });
  }

  handleClickOnDropdownItem = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;

    switch (value) {
      case 'RENAME_FOLDER':
        this.setState({
          showRenameFolder: true,
        });
        break;
      case 'MOVE_FOLDER':
        this.moveToFolder();
        break;
      case 'REMOVE_FOLDER':
        this.setState({
          showDeleteModal: true,
        });
        break;
    }
  };

  renderModal() {
    return (
      <Dialog
        modal={false}
        open={this.state.showModal}
        onRequestClose={this.closeModal}
        className="move-to-folder-material-modal"
      >
        <MoveToFolder
          folderId={this.props.folderId}
          onSaveHandler={this.moveFolder}
          onCancelHandler={this.closeModal}
        />
      </Dialog>
    );
  }

  renderRenameFolder() {
    const folderName = this.props.folderData.get('name');

    return (
      <Dialog
        modal={false}
        open={this.state.showRenameFolder}
        onRequestClose={this.closeModal}
        className="move-to-folder-material-modal"
      >
        <RenameFolder
          folderId={this.props.folderId}
          folderName={folderName}
          onSaveHandler={this.renameFolder}
          onCancelHandler={this.closeModal}
        />
      </Dialog>
    );
  }

  renderRemoveFolderModal() {
    if (!this.state.showDeleteModal) {
      return null;
    }

    return (
      <Dialog
        modal={false}
        open={true}
        onRequestClose={() => {
          this.setState({showDeleteModal: false});
        }}
        className="workitem-move-to"
      >
        <div>
          <h4 className="confirmation-message">Delete folder</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following folder ?
          </p>
          <div className="dialog-footer">
            <button type="button" className="button button--primary" onClick={this.remove}>Ok</button>
            <button
              type="button"
              className="button button--link"
              onClick={() => {
                this.setState({showDeleteModal: false});
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

  render() {
    const {
      folderData,
      folderId,
      workspaceId,
    } = this.props;
    const containerClassString = classnames('folder card');
    const folderName = folderData.get('name');

    if (folderId) {
      return (
        <div className={containerClassString}>
          <Link onClick={() => this.props.clickOnFolder(folderId)}>
            <div className="card--board">
              {folderName}
            </div>
          </Link>
          <div className="folder-icon" onClick={() => this.props.clickOnFolder(folderId)}>
            <img className="folder-cirle-icon" src="/assets/images/folder-circle.svg" />
            <img className="folder-folder-icon" src="/assets/images/folder-icon.svg" />
          </div>
          <div className="folders-actions">
            <IconMenu
              iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
              anchorOrigin={{horizontal: 'left', vertical: 'top'}}
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              onItemClick={this.handleClickOnDropdownItem}
            >
              <MenuItem
                primaryText="Rename folder"
                leftIcon={<i className="far fa-edit" style={{top: '3px'}}/>}
                value="RENAME_FOLDER"
              />
              <MenuItem
                primaryText="Move folder"
                leftIcon={<i className="fas fa-exchange-alt" style={{top: '3px'}}/>}
                value="MOVE_FOLDER"
              />
              <Divider />
              <MenuItem
                primaryText="Delete folder"
                leftIcon={<i className="far fa-trash-alt" style={{top: '3px'}} />}
                value="REMOVE_FOLDER"
              />
            </IconMenu>
          </div>

          {this.renderModal()}
          {this.renderRenameFolder()}
          {this.renderRemoveFolderModal()}
        </div>
      );
    }

    return false;
  }
}

FolderListCard.defaultProps = {};

FolderListCard.propTypes = {
  dispatch: PropTypes.func.isRequired,
  folderData: PropTypes.object.isRequired,
  folderId: PropTypes.number.isRequired,
  workspaceId: PropTypes.number.isRequired,
  clickOnFolder: PropTypes.func.isRequired,
};

export default connect((state, props) => {
  const companyStore = state.company;

  return {
    workspaceId: companyStore.lastWorkspace,
  };
})(FolderListCard);
