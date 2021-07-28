/**
 * @namespace workspace.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, FieldArray, reduxForm, change, registerField} from 'redux-form';
import classnames from 'classnames';
import {connect} from 'react-redux';

// services
import l10nService from '../l10n/l10n.service';
import workspaceService from '../workspace/workspace.service';

// routes

// actions
import {
  hideLoader,
  showLoader,
} from '../loader/loader.actions';
import {dismissDialog} from '../dialog/dialog.actions';
import {addWorkspace} from '../workspace/workspace.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from '../alerts/alert.actions';

// components
import WorkspaceMembers from './workspace.members.component';
import InputField from '../../components/form/inputField/inputField.component';
import Button from '../../components/button/button.component';
import WorkcycleEditor from '../common/editor.component';
import editorService from '../common/editor.service';

const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate board name
  if (!values.workspaceName) {
    errors.workspaceName = REQUIRED;
  }

  return errors;
};

class Workspace extends Component {

  state = {
    visibleTab: 'info',
    editorState: editorService.getState(null),
  };

  componentWillMount() {
    const {
      workspace,
    } = this.props;
    if (workspace) {
      this.setState({editorState: editorService.getState(workspace.description || '')});
    }
  }

  getDescriptionContainerClassString(fieldObject) {
    const {
      meta: {
        submitFailed,
        error,
      },
    } = fieldObject;

    return classnames('description-field form-group', {
      'form-group--error': submitFailed && error,
    });
  }

  handleSuccesOnCreateWorkspace(apiResponse, workspace) {
    const {dispatch} = this.props;

    dispatch(addWorkspace({
      ...apiResponse,
      ...workspace,
    }));
    dispatch(dismissDialog());
    dispatch(hideLoader());

    if (this.props.workspace)
      dispatch(addSuccessAlert(`Your workspace ${workspace.name} has been updated successfully!`));
    else
      dispatch(addSuccessAlert(`Your workspace ${workspace.name} has been created!`));

    // redirect to new workspace, to also force a refresh.
    if (!this.props.workspace) {
      window.location.href = `/${apiResponse.id}`;
    }
  }

  handleFailureOnCreateWorkspace(error) {
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('We cannot create your workspace at the moment. Try again in a couple of minutes.'));
  }

  submit = (values) => {
    const {
      company: {
        lastWorkspace,
      },
      workspace,
      dispatch,
    } = this.props;

    const descriptionMeta = editorService.getEditorData(this.state.editorState.getCurrentContent());

    const newWorkspace = {
      name: values.workspaceName,
      description: descriptionMeta.html,
      members: values.members,
    };

    dispatch(showLoader());

    let savePromise = null;
    if (workspace) {
      savePromise = workspaceService.updateWorkspace(workspace.id, newWorkspace);
    } else {
      savePromise = workspaceService.createWorkspace(newWorkspace);
    }

    savePromise.then(response => this.handleSuccesOnCreateWorkspace(response, newWorkspace))
      .catch(error => this.handleFailureOnCreateWorkspace(error));
  };

  editorStateChanged(editorState) {
    this.setState({editorState: editorState});
  }

  handleCancelCreateWorkspace = () => {
    const {dispatch} = this.props;
    dispatch(dismissDialog());
  };

  renderTitle() {
    const {visibleTab} = this.state;
    const {workspace} = this.props;

    const infoClass = classnames('tab', {
      'tab-selected': visibleTab === 'info',
    });

    const membersClass = classnames('tab', {
      'tab-selected': visibleTab === 'members',
    });

    const inviteClass = classnames('tab', {
      'tab-selected': visibleTab === 'invite',
    });

    return (
      <div className="board-header">
        <h3 className="text--bold">Workspace setup</h3>
        {/*
          TODO: add context menu here
          <div>board menu - TBC</div>
        */}
        <div className="flex-center-space-evenly">
          <div className="tabs">
            {
              workspace ?
                <span className={inviteClass} onClick={() => this.setState({visibleTab: 'invite'})}>
                  INVITE
                </span> : false
            }

            {
              workspace ?
                <span className={membersClass} onClick={() => this.setState({visibleTab: 'members'})}>
                  MEMBERS
                </span> : false
            }

            <span className={infoClass} onClick={() => this.setState({visibleTab: 'info'})}>
             INFO
            </span>
          </div>
        </div>
      </div>
    );
  }

  renderDescriptionFieldError(formField) {
    const {
      meta: {
        submitFailed,
        error,
      },
    } = formField;

    if (submitFailed && error) {
      return (
        <span className="error">{error}</span>
      );
    }

    return false;
  }

  renderDescriptionField = (formField) => {
    const {
      input,
      meta: {
        submitFailed,
        error,
      },
    } = formField;

    return (
      <div className="description-field-body form-group">
        <WorkcycleEditor
          editorState={this.state.editorState}
          onChange={this.editorStateChanged.bind(this)}
          disableMention={true}
        />

        {this.renderDescriptionFieldError(formField)}
      </div>
    );
  };

  renderFormButtons() {
    return (
      <div className="bord-form-actions row">
        <div className="col-xs-6 text-right">
          <Button
            label="Save"
            type="primary"
            shouldSubmitForm={true}
          />
        </div>
        <div className="col-xs-6 text-left">
          <Button
            label="Cancel"
            onClick={this.handleCancelCreateWorkspace}
            type="link"
          />
        </div>
      </div>
    );
  }

  renderInfoTab() {

    if (this.state.visibleTab === 'info') {
      return (
        <form onSubmit={this.props.handleSubmit(this.submit)} noValidate>
          <Field
            name="workspaceName"
            type="text"
            component={InputField}
            placeholder="Enter the workspace name"
          />

          <Field name="workspaceDescription" component={this.renderDescriptionField.bind(this)}/>

          {this.renderFormButtons()}
        </form>
      );
    }

    return false;
  }

  renderMembersTab() {
    const {workspace} = this.props;

    if (this.state.visibleTab === 'members') {
      return (<div>
        <WorkspaceMembers workspace={workspace} invite={false} manage={true}/>
      </div>);
    }
    return false;
  }

  renderInviteTab() {
    const {workspace} = this.props;

    if (this.state.visibleTab === 'invite') {
      return (<div>
        <WorkspaceMembers workspace={workspace}/>
      </div>);
    }
    return false;
  }

  render() {
    const {workspace} = this.props;

    return (
      <div className="workspace-create">
        {this.renderTitle()}
        {this.renderInfoTab()}
        {workspace ? this.renderMembersTab() : false}
        {workspace ? this.renderInviteTab() : false}
      </div>
    );
  }
}

Workspace.propTypes = {
  company: PropTypes.object,
  dispatch: PropTypes.func,
  initialValues: PropTypes.object.isRequired,
  workspace: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
};

let workspaceForm = reduxForm({
  form: 'workspace',
  validate: validateFunction,
  enableReinitialize: true,
})(Workspace);

workspaceForm = connect((state, props) => {
  const workspace = props.workspace;
  const workspaceName = (workspace && workspace.name) || '';
  const workspaceDescription = (workspace && workspace.description) || '';

  const initialValues = {
    workspaceName,
  };

  return {
    initialValues,
    company: state.company,
    workspace,
  };
})(workspaceForm);

export default workspaceForm;
