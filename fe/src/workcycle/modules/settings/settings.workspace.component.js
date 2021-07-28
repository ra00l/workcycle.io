/**
 * @namespace settings.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {showConfirmationDialog, showDialog} from '../dialog/dialog.actions';
import Workspace from '../workspace/workspace.component';
import {connect} from 'react-redux';
import workspaceService from '../workspace/workspace.service';
import {addDangerAlert, addSuccessAlert} from '../alerts/alert.actions';
import {hideLoader, showLoader} from '../loader/loader.actions';
import {deleteWorkspace} from './../auth/auth.actions';
import {WORKSPACE_ROLES} from '../settings/settings.constants';
import Dialog from 'material-ui/Dialog';

class SettingsWorkspace extends Component {

  state = {
    workspaceList: [],
    showDeleteModal: false,
    workspaceIdToDelete: null,
  };

  componentWillMount() {
    // dispatch(getWorkspaceMembers(lastWorkspace));
    workspaceService.getWorkspaceList()
      .then(response => {
        this.setState({workspaceList: response});
      })
      .catch(error => {
        this.props.dispatch(addDangerAlert('Error loading workspace list. Try again in a couple of minutes.'));
      });
  }

  renderBoardList(boardCount) {
    return (
      <span className="badge badge-default">
        {boardCount} boards
      </span>
    );
  }

  openWorkspaceSettings = (workspaceId) => {

    workspaceService.getWorkspace(workspaceId)
      .then((response) => {
        const options = {
          closeCb: () => false,
          content: (
            <Workspace workspace={response} />
          ),
        };
        const buttons = [];

        this.props.dispatch(showDialog(options, buttons));
      });
  };

  openWorkspaceTemplates = (openWorkspaceTemplates) => {

    // workspaceService.getAvailableTemplates(workspaceId, true)
    //   .then((response) => {
    //     const options = {
    //       closeCb: () => false,
    //       content: (
    //         <WorkspaceTemplates templateList={response} />
    //       ),
    //     };
    //     const buttons = [];
    //
    //     this.props.dispatch(showDialog(options, buttons));
    //   });
  };


  confirmDeleteWorkspace = (workspaceId) => {
    this.setState({
      workspaceIdToDelete: workspaceId,
      showDeleteModal: true,
    });
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
          <h4 className="confirmation-message">Delete workspace</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete this workspace ?
          </p>
          <div className="dialog-footer">
            <button type="button" className="button button--primary" onClick={() => this.deleteWorkspace()}>Ok</button>
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

  deleteWorkspace() {
    const {dispatch} = this.props;
    const id = this.state.workspaceIdToDelete;

    dispatch(showLoader());

    workspaceService.deleteWorkspace(id).then(response => {
      const wkList = this.state.workspaceList.slice();
      wkList.splice(wkList.findIndex(w => w.id === id), 1);

      this.setState({
        workspaceList: wkList,
        showDeleteModal: false,
        workspaceIdToDelete: null,
      });

      // update the auth -> userInfo store
      dispatch(deleteWorkspace(id));

      dispatch(hideLoader());
      dispatch(addSuccessAlert('Workspace deleted successfully!'));
    })
      .catch(error => {
        dispatch(hideLoader());
        dispatch(addDangerAlert('There was an error deleteing your workspace. Try again in a couple of minutes.'));
      });
  }

  renderWorkspaceList(wkList) {

    if (wkList.length === 0) {
      return (<p>No workspaces to display!</p>);
    }

    return (
      <ul className="mainList">
        {
          wkList.map((wk) => {
            let wkActions = false;
            if (wk.role === 'a') {
              wkActions = (<div className="col-sm-3">
                {/* <a title="Manage workspace templates" onClick={() => this.openWorkspaceTemplates(wk.id)}><i className="fa fa-align-center"/></a> */}
                <a title="Manage workspace settings" onClick={() => this.openWorkspaceSettings(wk.id)}><i className="fa fa-cog"/></a>
                <a title="Delete workspace" onClick={() => this.confirmDeleteWorkspace(wk.id)}><i className="fa fa-times"/></a>
              </div>);
            }

            return (
              <li key={wk.id}>
                <div className="col-sm-6">
                  <a href={`/${wk.id}`}>
                    {wk.name}
                    <span className="badge badge-secondary">{WORKSPACE_ROLES[wk.role]}</span>
                  </a>
                </div>
                <div className="col-sm-3">
                  {this.renderBoardList(wk.boardcount)}
                </div>
                {wkActions}
              </li>
            );
          }
          )
        }
      </ul>);
  }

  render() {
    const activeUserId = this.props.userInfo.id;
    const userCreatedWorkspaces = this.state.workspaceList.filter(w => w.createdBy === activeUserId);
    const userMemberWorkspaces = this.state.workspaceList.filter(w => w.createdBy !== activeUserId);

    return (
      <div className="col-sm-6 col-sm-offset-3 ">
        <div className="row">
          <h2>Created by you:</h2>
          {this.renderWorkspaceList(userCreatedWorkspaces)}
        </div>

        <div className="row">
          <h2>You are part of:</h2>
          {this.renderWorkspaceList(userMemberWorkspaces)}
        </div>

        {this.renderDeleteModal()}
      </div>
    );
  }

}

SettingsWorkspace.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  userInfo: PropTypes.object,
};


const settingsWorkspace = connect((state, props) => {
  const authStore = state.auth;
  return {
    userInfo: authStore.userInfo,
  };
})(SettingsWorkspace);

export default settingsWorkspace;
