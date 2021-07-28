import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Map} from 'immutable';
import {connect} from 'react-redux';

import {showDialog} from '../dialog/dialog.actions';

import CreateBoard from './board/createBoardModal.component';
import BoardListCard from './board.list.card.component';
import FolderListCard from './../folders/folder.list.card.component';

import Folder from './../folders/folderModal.component';

import {ContextMenu, MenuItem, ContextMenuTrigger} from 'react-contextmenu';

class BoardsList extends Component {

  state = {
    currentFolder: null,
  }

  componentWillMount() {
    const {board} = this.props;

    this.goToFolder(board.get('idFolder'));
  }

  componentWillReceiveProps(nextProps) {
    const {board} = nextProps;

    this.goToFolder(board.get('idFolder'));
  }

  goToFolder = (folderId) => {
    this.setState({
      currentFolder: folderId,
    });
  }

  handleClickOnContextMenu = (e, data) => {
    const options = {
      closeCb: () => false,
      content: null,
    };
    const buttons = [];


    switch (data.type) {
      case 'folder':
        options.content = (
          <Folder type={0} />
        );
        break;
      case 'board':
        options.content = (
          <CreateBoard />
        );
        options.className = 'create-board-modal-container';

        this.props.dispatch(showDialog(options, buttons));
        break;
    }

    this.props.dispatch(showDialog(options, buttons));
  }

  handleClickOnAddNewBoard = () => {
    const options = {
      closeCb: () => false,
      content: (
        <CreateBoard />
      ),
      className: 'create-board-modal-container',
    };
    const buttons = [];

    this.props.dispatch(showDialog(options, buttons));
  }

  renderBoardCards(boardsToRender, boardId) {
    const boardsMarkup = boardsToRender.map((itemId, index) => {
      const isBoardSelected = parseFloat(boardId) === itemId;

      return (
        <BoardListCard
          key={index}
          boardId={itemId}
          isSelected={isBoardSelected}
        />
      );
    });

    return boardsMarkup;
  }

  renderFolderCards(foldersToRender, foldersData) {
    const foldersMarkup = foldersToRender.map((folderId, index) => {
      const folderData = foldersData.get(`${folderId}`);

      return (
        <FolderListCard
          key={index}
          folderId={folderId}
          folderData={folderData}
          clickOnFolder={this.goToFolder}
        />
      );
    });

    return foldersMarkup;
  }

  renderFoldersAndBoardList() {
    const {
      boardId,
      boardsOrder,
      foldersData,
      sortedFolders,
    } = this.props;
    const {currentFolder} = this.state;

    let boardsToRender = [];
    let foldersToRender = [];

    if (currentFolder) {
      // render boards from the current folder
      const folder = foldersData.get(`${currentFolder}`);
      boardsToRender = folder.get('boards');
    } else if (boardsOrder.size > 0) {
      boardsToRender = boardsOrder;
    }

    if (currentFolder) {
      // render the subfolders
      const folder = foldersData.get(`${currentFolder}`);
      foldersToRender = folder.get('subFolders');
    } else if (sortedFolders.size > 0) {
      foldersToRender = sortedFolders;
    }

    // there is 0 boards and folders created
    if (boardsOrder.size === 0 && sortedFolders.size === 0) {
      return (
        <div className="add-your-board" onClick={this.handleClickOnAddNewBoard}>
          <img src="/assets/images/no_boards.svg" />
          <h4>Add a new board</h4>
        </div>
      );
    }

    // there is 0 boards in the current folder
    if (boardsToRender.size === 0 && foldersToRender.size === 0) {
      return (
        <div className="no-boards-in-folder" onClick={this.handleClickOnAddNewBoard}>
          <img src="/assets/images/empty_folder.svg" />
          <h4>No results found..</h4>
        </div>
      );
    }

    const boards = this.renderBoardCards(boardsToRender, boardId);
    const folders = this.renderFolderCards(foldersToRender, foldersData);

    return (
      <div>
        {folders}
        {boards}
      </div>
    );
  }

  renderBreadcrumbs() {
    const {currentFolder} = this.state;
    const {
      boardsOrder,
      foldersData,
    } = this.props;

    if (!currentFolder) {
      return (
        <div className="section-title">
          <h4>Boards {boardsOrder.size > 0 ? `(${boardsOrder.size})` : false}</h4>
        </div>
      );
    }

    const parents = [];
    const currentFolderData = foldersData.get(`${currentFolder}`);
    let parent = currentFolderData.get('idParent');

    parents.push(currentFolder);

    while (parent) {
      parents.push(parent);

      const parentData = foldersData.get(`${parent}`);
      parent = parentData.get('idParent');
    }

    const breadCrumbs = parents.reverse();

    const breadCrumbsMarkup = breadCrumbs.map((folderId, index) => {
      const folder = foldersData.get(`${folderId}`);

      return (
        <span key={index}>
          <span> / </span>
          <span className="breadcrumbs-item" onClick={() => this.goToFolder(folderId)}>{folder.get('name')}</span>
        </span>
      );
    });

    return (
      <div className="breadcrumbs section-title">
        <span className="breadcrumbs-item" onClick={() => this.goToFolder(null)}>Boards</span>
        {breadCrumbsMarkup}
      </div>
    );
  }

  render() {
    return (
      <div className="boards-list">
        <ContextMenuTrigger id="board_list_context_menu">
          <div className="container main">
            {this.renderBreadcrumbs()}
            <div className="section-body">
              {this.renderFoldersAndBoardList()}
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenu id="board_list_context_menu">
          <MenuItem data={{type: 'folder'}} onClick={this.handleClickOnContextMenu}>
            Folder
          </MenuItem>
          <MenuItem data={{type: 'board'}} onClick={this.handleClickOnContextMenu}>
            Board
          </MenuItem>
        </ContextMenu>
      </div>
    );
  }
}

BoardsList.defaultProps = {
  boardsOrder: {},
  boardId: '',
};

BoardsList.propTypes = {
  board: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  boardsOrder: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  foldersData: PropTypes.object.isRequired,
  sortedFolders: PropTypes.object.isRequired,
  workspace: PropTypes.object.isRequired,
};

export default connect((state, props) => {
  const boardsStore = state.boards;
  const companyStore = state.company;
  const authStore = state.auth;
  const foldersStore = state.folders;

  const lastWorkspace = companyStore.lastWorkspace;
  const workspaceList = authStore.userInfo && authStore.userInfo.workspaceList || [];
  let workspace = {};

  workspaceList.map(item => {
    if (item.id === lastWorkspace) {
      workspace = item;
    }
  });

  const board = boardsStore.getIn(['data', `${props.boardId}`]) || Map();

  const sortedFolders = foldersStore.get('sortedFolders') || Map();
  const foldersData = foldersStore.get('data') || Map();

  return {
    board,
    boardsOrder: boardsStore.get('sorted'),
    foldersData,
    sortedFolders,
    workspace,
  };
})(BoardsList);
