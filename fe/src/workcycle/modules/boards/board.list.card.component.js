import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, browserHistory} from 'react-router';
import classnames from 'classnames';
import {connect} from 'react-redux';

import BoardsService from './boards.service';

import BoardModal from './board/boardModal.component';
import CloneBoardModal from './board/cloneBoardModal.component';
import ROLE from '../../contants/role.constants';

import Dialog from 'material-ui/Dialog';
import MoveToFolder from './../folders/moveToFolder.component';

import {
  cloneBoard,
  removeBoard,
  saveBoardAsTemplate,
  moveBoard,
} from './boards.actions';

import {
  showDialog,
  showConfirmationDialog,
  dismissDialog,
} from '../dialog/dialog.actions';
import {moveBoardToFolder} from './../folders/folders.actions';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import browserUtilService from '../../services/browser.util.service';
import {addSuccessAlert} from '../alerts/alert.actions';

class BoardsListCard extends Component {

  state = {
    showMoveToFolderModal: false,
    showDeleteModal: false,
  };

  remove = () => {
    const {
      boardData,
      dispatch,
      workspaceId,
      board,
    } = this.props;
    const boardId = boardData.get('id');
    const folderId = boardData.get('idFolder');

    BoardsService.removeBoard(workspaceId, boardId)
      .then(response => {
        dispatch(removeBoard(boardId, folderId));
        
        // if this is the same board as the one that is open the go to workspace landing page
        if (board.boardId === boardId) {
          browserHistory.push(`/${workspaceId}`);
        }
      })
      .catch(err => {
        // TODO: alert something went wrong
      });

    this.setState({showDeleteModal: false});
  }

  clone = (boardName, folderId) => {
    const {
      boardData,
      dispatch,
      workspaceId,
    } = this.props;
    const boardId = boardData.get('id');

    dispatch(cloneBoard(workspaceId, boardId, false, folderId, boardName));
    dispatch(dismissDialog());
  }

  cloneBoard = () => {
    const {
      boardData,
      dispatch,
    } = this.props;
    const boardId = boardData.get('id');
    const folderId = boardData.get('idFolder');

    const options = {
      closeCb: () => false,
      content: (
        <CloneBoardModal
          boardId={boardId}
          folderId={folderId}
          boardData={boardData}
          saveHandler={this.clone}
          cancelHandler={() => {
            const {dispatch} = this.props;
            dispatch(dismissDialog());
          }}
        />
      ),
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  saveTemplate = () => {
    const {
      boardData,
      dispatch,
      workspaceId,
    } = this.props;
    const boardId = boardData.get('id');

    dispatch(saveBoardAsTemplate(workspaceId, boardId));
  }

  saveBoardAsTemplate = () => {
    const options = {
      closeCb: () => false,
      content: (
        <div>
          <h4 className="confirmation-message">Save board as template</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to save a template for this board
            <span className="text--italic"> {this.props.boardData.get('name')}</span> ?
          </p>
        </div>
      ),
    };
    const buttons = {
      clickCb: this.saveTemplate,
      label: 'Save as template',
    };

    this.props.dispatch(showConfirmationDialog(options, buttons));
  };

  editBoard = () => {
    const {
      boardData,
      dispatch,
    } = this.props;
    const boardId = boardData.get('id');

    const options = {
      closeCb: () => false,
      content: (
        <BoardModal
          boardId={boardId}
          editMode={true}
        />
      ),
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  moveFolder = (toFolder) => {
    const {
      boardData,
      workspaceId,
      dispatch,
    } = this.props;

    const boardId = boardData.get('id');
    const fromFolder = boardData.get('idFolder');

    BoardsService.updateBoard(workspaceId, boardId, {
      idFolder: toFolder,
    })
      .then(response => {
        dispatch(moveBoard(boardId, toFolder, fromFolder));
        dispatch(moveBoardToFolder(boardId, toFolder, fromFolder));

        this.setState({
          showMoveToFolderModal: false,
        });
      })
      .catch(err => {
        // TODO: alert something went wrong
        this.setState({
          showMoveToFolderModal: false,
        });
      });
  }

  handleClickOnDropdownItem = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;

    switch (value) {
      case 'REMOVE_BOARD':
        this.setState({
          showDeleteModal: true,
        });
        break;
      case 'CLONE_BOARD':
        this.cloneBoard();
        break;
      case 'COPY_BOARD_LINK':
        this.copyBoardLink();
        break;
      case 'SAVE_BOARD_TEMPLATE':
        this.saveBoardAsTemplate();
        break;
      case 'MOVE_FOLDER':
        this.setState({
          showMoveToFolderModal: true,
        });
        break;
      case 'EDIT_BOARD':
        this.editBoard();
        break;
    }
  };

  copyBoardLink() {
    const {
      boardData,
      dispatch,
      workspaceId,
    } = this.props;

    const boardId = boardData.get('id');
    browserUtilService.copyToClipboard(browserUtilService.getAbsoluteLink(`/${workspaceId}/boards/${boardId}`));
    dispatch(addSuccessAlert('Link to board copied to clipboard!'));
  }


  closeModal = () => {
    this.setState({
      showMoveToFolderModal: false,
    });
  }

  renderModal() {
    if (!this.state.showMoveToFolderModal) {
      return null;
    }

    return (
      <Dialog
        modal={false}
        open={true}
        onRequestClose={this.closeModal}
        className="move-to-folder-material-modal"
      >
        <MoveToFolder
          onSaveHandler={this.moveFolder}
          onCancelHandler={this.closeModal}
        />
      </Dialog>
    );
  }

  renderDeleteModal() {
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
          <h4 className="confirmation-message">Delete board</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following board
            <span className="text--italic"> {this.props.boardData.get('name')}</span> ?
            Please be aware that everything will be lost and you can't undo this action.
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
      boardData,
      isSelected,
      workspaceId,
    } = this.props;
    const containerClassString = classnames('board-card card', {
      'card--active': isSelected,
    });
    const boardId = boardData.get('id');
    const boardName = boardData.get('name');
    const boardRole = boardData.get('role');

    let boardActions = (<IconMenu
      iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'right', vertical: 'top'}}
      onItemClick={this.handleClickOnDropdownItem}
    >
      <MenuItem
        primaryText="Board settings"
        leftIcon={<i className="fas fa-cog" style={{top: '3px'}}/>}
        value="EDIT_BOARD"
      />
      <MenuItem
        primaryText="Move to folder"
        leftIcon={<i className="fas fa-exchange-alt" style={{top: '3px'}}/>}
        value="MOVE_FOLDER"
      />
      <MenuItem
        primaryText="Save as template"
        leftIcon={<i className="far fa-address-card" style={{top: '3px'}}/>}
        value="SAVE_BOARD_TEMPLATE"
      />
      <MenuItem
        primaryText="Clone board"
        leftIcon={<i className="far fa-copy" style={{top: '3px'}}/>}
        value="CLONE_BOARD"
      />
      <MenuItem
        primaryText="Copy board link"
        leftIcon={<i className="fas fa-link" style={{top: '3px'}}/>}
        value="COPY_BOARD_LINK"
      />
      <Divider/>
      <MenuItem
        primaryText="Delete board"
        leftIcon={<i className="far fa-trash-alt" style={{top: '3px'}}/>}
        value="REMOVE_BOARD"
      />
    </IconMenu>);

    if (boardRole !== ROLE.ADMIN) {
      boardActions = null;
    }

    if (boardId) {
      return (
        <div className={containerClassString}>
          <Link to={`/${workspaceId}/boards/${boardId}`}>
            <div className="card--board">
              {boardName}
            </div>
          </Link>
          <div className="board-actions">
            {boardActions}

            {this.renderModal()}
            {this.renderDeleteModal()}
          </div>
        </div>
      );
    }

    return false;
  }
}

BoardsListCard.defaultProps = {
  boardData: {},
  isSelected: false,
};

BoardsListCard.propTypes = {
  boardData: PropTypes.object,
  boardId: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  workspaceId: PropTypes.number.isRequired,
  board: PropTypes.object,
};

export default connect((state, props) => {
  const boardsStore = state.boards;
  const companyStore = state.company;
  const board = state.board;

  return {
    boardData: boardsStore.getIn(['data', `${props.boardId}`]),
    workspaceId: companyStore.lastWorkspace,
    board,
  };
})(BoardsListCard);
