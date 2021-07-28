import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';

// actions
import {getBoards} from './boards.actions';
import {showDialog} from './../dialog/dialog.actions';
import {invalidateWorkItem} from './../workItems/workItem.actions';

// components
import BoardsList from './boards.list.component';
import BoardInfo from './boardInfo.component';
import WorkItemModal from './../workItems/workItem/modal/workItemModal.component';

import Dialog from 'material-ui/Dialog';

class BoardLandingPage extends Component {

  state = {
    showWorkItemModal: false,
  }

  componentWillMount() {
    const {
      company: {
        lastWorkspace,
      },
      params: {
        boardId,
        itemId,
      },
    } = this.props;

    this.props.dispatch(getBoards(lastWorkspace));

    if (boardId && itemId) {
      this.showWorkItemModal();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      params: {
        boardId,
        itemId,
      },
    } = nextProps;

    if (boardId && itemId) {
      this.showWorkItemModal();
    }
  }

  showWorkItemModal() {
    this.setState({
      showWorkItemModal: true,
    });
  }

  closeWorkItemModal = () => {
    const {
      dispatch,
      params: {
        boardId,
        workspaceId,
      },
    } = this.props;

    // invalidate workItem store
    dispatch(invalidateWorkItem());

    this.setState({
      showWorkItemModal: false,
    });

    browserHistory.push(`/${workspaceId}/boards/${boardId}`);
  }

  closeModal = () => {
    const {
      params: {
        boardId,
        workspaceId,
      },
    } = this.props;

    this.setState({
      showWorkItemModal: false,
    });

    browserHistory.push(`/${workspaceId}/boards/${boardId}`);
  }

  renderWorkItemModal() {
    const {
      dispatch,
      params: {
        boardId,
        itemId,
        workspaceId,
      },
    } = this.props;

    if (boardId && itemId) {
      return (
        <Dialog
          modal={false}
          open={this.state.showWorkItemModal}
          onRequestClose={this.closeWorkItemModal}
          className="workItem-material-modal"
          autoScrollBodyContent={true}
          contentStyle={{transform: 'translate(0px, 0px)'}}
        >
          <WorkItemModal
            boardId={boardId}
            workItemId={itemId}
            workspaceId={+workspaceId}
            closeModal={this.closeModal}
          />
        </Dialog>
      );
    }

    return false;
  }

  render() {
    const {
      company: {
        lastWorkspace,
      },
      dispatch,
      params: {
        boardId,
        itemId,
      },
    } = this.props;

    // TODO render children when we have item in url

    return (
      <div className="board-detailed">
        <BoardsList boardId={boardId} />
        <BoardInfo boardId={boardId} />

        {this.renderWorkItemModal()}
      </div>
    );
  }
}

BoardLandingPage.propTypes = {
  children: PropTypes.node,
  company: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

export default connect((state) => ({
  company: state.company,
}))(BoardLandingPage);
