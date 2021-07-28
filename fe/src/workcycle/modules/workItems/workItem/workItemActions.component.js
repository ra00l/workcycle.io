import React, {Component} from 'react';
import PropTypes from 'prop-types';

// material-ui components
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import WorkItemCreateChildForm from './workItem.createChildForm.component';
import WorkItemMoveToForm from './workItem.moveToForm.component';
import WorkItemAddAsChildTo from './workItemAddAsChildTo.component';
import Dialog from 'material-ui/Dialog';

import WorkItemClone from './workItem.clone.component';

// constants
// import {MAX_LEVEL_OF_CHILDS} from './../../../contants/workItem.constants';

// // actions
import {
  showDialog,
  showConfirmationDialog,
} from '../../dialog/dialog.actions';
import {
//   addWorkItems,
  deleteWorkItem,
  cloneWorkItem,
  convertToWorkItem,
//   addChildWorkItem,
//   removeChildWorkItem,
//   updateWorkItem,
} from '../workItems.actions';

import browserUtilService from '../../../services/browser.util.service';
import {addSuccessAlert} from '../../alerts/alert.actions';

// import {
//   addWorkItemIdToNest,
//   removeWorkItemFromNest,
// } from '../../nests/nests.actions';
// import {
//   showLoader,
//   hideLoader,
// } from '../../loader/loader.actions';
// import {addDangerAlert} from '../../alerts/alert.actions';

// // services
// import workItemService from './workItem.service';
// import l10nService from '../../l10n/l10n.service';

class WorkItemActions extends Component {

  state = {
    showMoveToModal: false,
    showDeleteModal: false,
  }

  handleClickOnDropdownItem = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;

    switch (value) {
      case 'MOVE_TO':
        this.handleMoveWorkItem();
        break;
      case 'CLONE_DUPLICATE':
        this.handleCloneWorkItem();
        break;
      case 'COPY_LINK':
        this.handleCopyLink();
        break;
      case 'REMOVE':
        this.handleDeleteWorkItem();
        break;
      case 'CONVERT_TO_WORKITEM':

        this.convertToItem();
        break;
      case 'CREATE_CHILD':
        this.handleCreateChild();
        break;
      case 'ADD_CHILD_TO':
        this.handleAddAsChildTo();
    }
  };

  handleCopyLink() {
    const {
      boardId,
      workItem,
      dispatch,
      workspaceId,
    } = this.props;

    const workItemId = workItem.get('id');

    browserUtilService.copyToClipboard(browserUtilService.getAbsoluteLink(`/${workspaceId}/boards/${boardId}/item/${workItemId}`));
    dispatch(addSuccessAlert('Link to work item copied to clipboard!'));
  }

  handleCreateChild() {
    const {
      boardId,
      dispatch,
      workItem,
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <WorkItemCreateChildForm
          boardId={boardId}
          dispatch={dispatch}
          nestId={workItem.get('idNest')}
          childOf={workItem.get('id')}
        />
      ),
      className: 'workitem-create-child',
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  handleDeleteWorkItem() {
    this.setState({
      showDeleteModal: true,
    });
  }

  deleteWorkItem = () => {
    const {
      boardId,
      workItem,
      isGoal,
    } = this.props;

    const workItemId = workItem.get('id');
    let nestId = workItem.get('idNest');
    const parentId = workItem.get('idParent');
    if (!nestId) {
      nestId = workItem.getIn(['nest', 'id']);
    }

    this.props.dispatch(deleteWorkItem(workItemId, nestId, boardId, parentId, isGoal));
    this.setState({
      showDeleteModal: false,
    });
    this.props.deleteHandler();
  };

  handleMoveWorkItem() {
    this.setState({
      showMoveToModal: true,
    });
  }

  handleCloneWorkItem() {
    const {
      boardId,
      workItem,
      dispatch,
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <WorkItemClone
          boardId={+boardId}
          dispatch={dispatch}
          workItem={workItem}
          nestId={workItem.get('idNest')}
        />
      ),
      className: 'workitem-clone',
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  convertToItem = () => {
    const {
      boardId,
      dispatch,
      workItem,
    } = this.props;

    dispatch(
      convertToWorkItem(
        boardId,
        workItem.get('idNest'),
        workItem.get('id'),
        workItem.get('idParent'),
        {idParent: null},
      )
    );
  }

  handleAddAsChildTo() {
    const {
      boardId,
      dispatch,
      workItem,
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <WorkItemAddAsChildTo
          boardId={boardId}
          workItem={workItem}
          workItemId={workItem.get('id')}
        />
      ),
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  renderActions() {
    const {
      workItem,
    } = this.props;

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        onItemClick={this.handleClickOnDropdownItem}
      >
        <MenuItem primaryText="Create child item" value="CREATE_CHILD"/>

        {
          workItem.get('idParent') ?
            <MenuItem primaryText="Convert to Item" value="CONVERT_TO_WORKITEM"/> :
            false
        }

        <MenuItem primaryText="Make child of" value="ADD_CHILD_TO"/>

        <MenuItem primaryText="Move to" value="MOVE_TO"/>
        <MenuItem primaryText="Clone" value="CLONE_DUPLICATE"/>
        <MenuItem primaryText="Copy item link" value="COPY_LINK"/>
        <Divider/>
        <MenuItem primaryText="Delete" value="REMOVE"/>
      </IconMenu>
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
          <h4 className="confirmation-message">Delete work item</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following work item
            <span className="text--italic"> {this.props.workItem.get('title')}</span> ?
          </p>
          <div className="dialog-footer">
            <button type="button" className="button button--primary" onClick={this.deleteWorkItem}>Ok</button>
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

  renderMoveToModal() {
    const {
      boardId,
      workItem,
    } = this.props;

    let nestId = workItem.get('idNest');

    if (!nestId) {
      nestId = workItem.getIn(['nest', 'id']);
    }

    if (this.state.showMoveToModal) {
      return (
        <Dialog
          modal={false}
          open={true}
          onRequestClose={() => {
            this.setState({showMoveToModal: false});
          }}
          className="workitem-move-to"
        >
          <WorkItemMoveToForm
            boardId={boardId}
            nestId={nestId}
            workItem={workItem}
          />
        </Dialog>
      );
    }
    return null;
  }

  render() {
    const style = {
      display: 'inline-block',
      marginRight: '-17px',
    };

    return (
      <span style={style}>
        {this.renderActions()}

        {this.renderMoveToModal()}
        {this.renderDeleteModal()}
      </span>
    );
  }
}

WorkItemActions.defaultProps = {
  deleteHandler: () => false,
  isGoal: false,
};

WorkItemActions.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  workItem: PropTypes.object.isRequired,
  isGoal: PropTypes.bool,
  deleteHandler: PropTypes.func,
  workspaceId: PropTypes.number,
};

export default WorkItemActions;
