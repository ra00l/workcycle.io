import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, browserHistory} from 'react-router';
import classnames from 'classnames';
import {connect} from 'react-redux';

import BoardsService from './../boards/boards.service';

import BoardModal from './../boards/board/boardModal.component';
import ROLE from '../../contants/role.constants';

import Dialog from 'material-ui/Dialog';

import {
  cloneBoard,
  removeBoard,
} from './../boards/boards.actions';
import {removeGoal} from './goals.actions';

import {
  showDialog,
  showConfirmationDialog,
} from './../dialog/dialog.actions';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import browserUtilService from '../../services/browser.util.service';
import {addSuccessAlert} from '../alerts/alert.actions';

class GoalListCard extends Component {

  state = {
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

    BoardsService.removeBoard(workspaceId, boardId)
      .then(response => {
        dispatch(removeBoard(boardId));
        dispatch(removeGoal(boardId));
        
        // if this is the same board as the one that is open the go to workspace landing page
        if (board.boardId === boardId) {
          browserHistory.push(`/${workspaceId}`);
        }

        this.setState({
          showDeleteModal: false,
        });
      })
      .catch(err => {
        // TODO: alert something went wrong
      });
  }

  clone = () => {
    const {
      boardData,
      dispatch,
      workspaceId,
    } = this.props;
    const goalId = boardData.get('id');

    dispatch(cloneBoard(workspaceId, goalId, true));
  }

  cloneGoal = () => {
    const options = {
      closeCb: () => false,
      content: (
        <div>
          <h4 className="confirmation-message">Clone goal</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to clone the following goal
            <span className="text--italic"> {this.props.boardData.get('name')}</span> ?
          </p>
        </div>
      ),
    };
    const buttons = {
      clickCb: this.clone,
      label: 'Clone',
    };

    this.props.dispatch(showConfirmationDialog(options, buttons));
  }

  editGoal = () => {
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
          isGoal={true}
        />
      ),
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  handleClickOnDropdownItem = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;

    switch (value) {
      case 'REMOVE_GOAL':
        this.setState({
          showDeleteModal: true,
        });
        break;
      case 'CLONE_GOAL':
        this.cloneGoal();
        break;
      case 'COPY_GOAL_LINK':
        this.copyGoalLink();
        break;
      case 'EDIT_GOAL':
        this.editGoal();
        break;
    }
  };

  copyGoalLink() {
    const {
      boardData,
      dispatch,
      workspaceId,
    } = this.props;

    const boardId = boardData.get('id');
    browserUtilService.copyToClipboard(browserUtilService.getAbsoluteLink(`/${workspaceId}/goals/${boardId}`));
    dispatch(addSuccessAlert('Link to goal copied to clipboard!'));
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
          <h4 className="confirmation-message">Delete goal</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following goal
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

    let goalActions = (<IconMenu
      iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'right', vertical: 'top'}}
      onItemClick={this.handleClickOnDropdownItem}
    >
      <MenuItem
        primaryText="Goal settings"
        leftIcon={<i className="fas fa-cog" style={{top: '3px'}}/>}
        value="EDIT_GOAL"
      />
      <MenuItem
        primaryText="Clone goal"
        leftIcon={<i className="far fa-copy" style={{top: '3px'}}/>}
        value="CLONE_GOAL"
      />
      <MenuItem
        primaryText="Copy goal link"
        leftIcon={<i className="fas fa-link" style={{top: '3px'}}/>}
        value="COPY_GOAL_LINK"
      />
      <Divider/>
      <MenuItem
        primaryText="Delete goal"
        leftIcon={<i className="far fa-trash-alt" style={{top: '3px'}}/>}
        value="REMOVE_GOAL"
      />
    </IconMenu>);

    if (boardRole !== ROLE.ADMIN) {
      goalActions = null;
    }

    if (boardId) {
      return (
        <div className={containerClassString}>
          <Link to={`/${workspaceId}/goals/${boardId}`}>
            <div className="card--board">
              {boardName}
            </div>
          </Link>
          <div className="board-actions">
            {goalActions}

            {this.renderDeleteModal()}
          </div>
        </div>
      );
    }

    return false;
  }
}

GoalListCard.defaultProps = {
  boardData: {},
  isSelected: false,
};

GoalListCard.propTypes = {
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
})(GoalListCard);
