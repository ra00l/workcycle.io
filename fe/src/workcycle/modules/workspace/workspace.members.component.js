/**
 * @namespace workspace.people.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {WORKSPACE_ROLES} from '../settings/settings.constants';

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

import {
  addDangerAlert,
  addSuccessAlert,
} from '../alerts/alert.actions';

// components
import Button from '../../components/button/button.component';
import {renderUserIcon} from '../users/user.helper';

/**
 * @private
 * @description Prefix for logging
 * @memberOf board.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[workspace.members.component]';

/**
 * Board form validation method
 *
 * @private
 * @const {Function}
 * @memberOf board.component
 *
 * @param {Object} values - from values
 * @param {Object} props - component props
 * @return {Object} validations errors
 */
const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate board name
  if (!values.workspaceName) {
    errors.workspaceName = REQUIRED;
  }

  return errors;
};

/**
 * Board component
 *
 * @class Board
 * @memberOf board.component
 * @extends React.Component
 *
 * @example
 * <Board />
 */
class WorkspaceMembers extends Component {

  state = {
    members: [],
    errorMessage: null,
  };

  /**
   * React lifecycle method
   *
   * @instance
   * @memberOf board.component.Board
   * @method componentWillMount
   */
  componentWillMount() {

    const {
      workspace,
      board,
    } = this.props;

    if (workspace) {
      workspaceService.getWorkspaceMembers(workspace.id)
        .then(response => {
          this.setState({members: response});
        })
        .catch(error => {
          this.setState({errorMessage: 'Canot get workspace members!'});
        });
    }
  }

  memberId = -1;
  addPersonToList(evt) {
    evt.preventDefault();

    const formData = evt.target.elements;
    const members = this.state.members.slice();
    const email = formData.email.value;
    const role = formData.role.value;

    if (email.indexOf('@') === -1) {
      return this.setState({errorMessage: 'Email is not valid!'});
    }

    const existingEmail = members.find(m => m.email === email);
    if (existingEmail) {
      return this.setState({errorMessage: 'Email already in list!'});
    }

    members.push({
      id: this.memberId,
      email: email,
      role: role,
      name: email.substr(0, email.indexOf('@')),
    });
    this.memberId -= 1;

    this.setState({members: members});

    formData.email.value = '';
    formData.role.value = 'r';

    return false;
  }

  /**
   * Success callback when the create board is resolved
   *
   * @instance
   * @memberOf board.component.Board
   * @method handleSuccesOnAddMembers
   *
   * @param {Object} apiResponse - the response of the api
   * @param {Object} board - the board object
   */
  handleSuccesOnAddMembers(apiResponse) {
    const {dispatch} = this.props;

    dispatch(dismissDialog());
    dispatch(hideLoader());

    if (this.props.invite !== false) {
      dispatch(addSuccessAlert('New people were invited successfully!'));
    } else {
      dispatch(addSuccessAlert('Permissions were updated successfully!'));
    }
  }

  /**
   * Failure callback when the create board is rejected
   *
   * @instance
   * @memberOf workspace.component.Board
   * @method handleFailureOnAddMembers
   */
  handleFailureOnAddMembers(error) {
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('There was an error inviting people the moment. Try again in a couple of minutes.'));
  }

  /**
   * Submit form method
   *
   * @instance
   * @memberOf workspace.component.Board
   * @method submit
   *
   * @param {Object} values - form values
   */
  invitePeople() {
    const {
      workspace,
      dispatch,
    } = this.props;

    if (this.state.members.filter(m => !m.deleted).length === 0) {
      return dispatch(addDangerAlert(
        'Workspace cannot be left with no members!'
      ));
    }
    if (this.state.members.filter(m => m.newRole === 'a' || m.role === 'a').length === 0) {
      return dispatch(addDangerAlert('Workspace should have at least 1 admin!'));
    }

    const members = this.state.members.filter(m => m.id < 0 || m.deleted || m.newRole); // added / deleted / role changed

    if (members.length === 0) {
      return dispatch(addDangerAlert('No new people to invite!'));
    }

    dispatch(showLoader());

    workspaceService.updateMembers(workspace.id, members)
      .then(response => this.handleSuccesOnAddMembers(response, members))
      .catch(error => this.handleFailureOnAddMembers(error));
  }

  /**
   * Click handler for the cancel button from create board modal
   *
   * @instance
   * @memberOf workspace.component.Workspace
   * @method handleCancelManageMembers
   */
  handleCancelManageMembers = () => {
    const {dispatch} = this.props;
    dispatch(dismissDialog());
  };

  /**
   * Render board title
   *
   * @instance
   * @memberOf board.component.Board
   * @method renderTitle
   *
   * @return {Object} JSX HTML Content
   */
  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">
          {this.props.invite !== false ? 'Invite people to your workspace' : 'Manage members access'}
        </h3>
      </div>
    );
  }

  /**
   * Render form buttons
   *
   * @instance
   * @memberOf board.component.Board
   * @method renderFormButtons
   *
   * @return {Object} JSX HTML Content
   */
  renderFormButtons() {
    return (
      <div className="bord-form-actions row">
        <div className="col-xs-6 text-right">
          <Button
            label={this.props.invite === false ? 'Update members' : 'Send invitation'}
            type="primary"
            onClick={this.invitePeople.bind(this)}
          />
        </div>
        <div className="col-xs-6 text-left">
          <Button
            label="Cancel"
            onClick={this.handleCancelManageMembers}
            type="link"
          />
        </div>
      </div>
    );
  }

  /**
   * Render board form
   *
   * @instance
   * @memberOf workspace.component.workspace
   * @method renderForm
   *
   * @return {Object} JSX HTML Content
   */
  renderForm() {

    const formClasses = classnames('form-group invite-people flex', {});

    const showError = () => {
      if (this.state.errorMessage)
        return (<p className="error-text">{this.state.errorMessage}</p>);
      return null;
    };

    const visibleMembers = this.state.members.sort((a, b) => a.id > b.id);

    let membersMarkup = false;
    if (this.props.invite !== false) {
      membersMarkup = (<div>
        <form
          onSubmit={this.addPersonToList.bind(this)}
          noValidate
          className={formClasses}
        >
          <input
            type="email"
            className="form-control flex-1 email"
            name="email"
            placeholder="Email address of the user to invite"
          />
          <select className="form-control flex-05 role" name="role" defaultValue={'r'}>
            <option value="r">{WORKSPACE_ROLES.r}</option>
            <option value="rw">{WORKSPACE_ROLES.rw}</option>
            <option value="a">{WORKSPACE_ROLES.a}</option>
          </select>
          <button
            type="submit"
            className="flex-05 button button--secondary"
          >
            Add
          </button>

        </form>
        {showError()}

        <hr/>
        <h4>Members to invite</h4>
        {visibleMembers.filter(m => m.id < 0).map(m => this.renderMember(m))}
      </div>);
    } else {
      membersMarkup = (<div>
        {visibleMembers.map(m => this.renderMember(m))}
      </div>);
    }

    return (
      <div>
        {membersMarkup}

        {this.renderFormButtons()}
      </div>
    );
  }

  toggleRemoveMember(memberId) {
    const members = this.state.members;

    if (memberId < 0) { // newly added member
      const toRemIdx = members.findIndex(m => m.id === memberId);
      if (toRemIdx > -1) {
        members.splice(toRemIdx, 1);
      }
    } else { // existing member, keep with flag
      const memberToRem = members.find(m => m.id === memberId);
      if (memberToRem) {
        memberToRem.deleted = !memberToRem.deleted;
      }
    }

    this.setState({members: members});
  }

  renderMember(member) {
    const classNames = classnames('flex member-row', {'member-deleted': member.deleted});

    return (<div key={member.id} className={classNames}>
      <div className="flex-03 avatar">{renderUserIcon(member.name, member.imageUrl)}</div>
      <div className="flex-1 name">{member.name} ({member.email})</div>
      <div className="flex-03 role">
        <select
          className="form-control"
          name="role"
          defaultValue={member.role}
          onChange={(evt) => {
            member.newRole = evt.target.value;
          }}
        >
          <option value="r">{WORKSPACE_ROLES.r}</option>
          <option value="rw">{WORKSPACE_ROLES.rw}</option>
          <option value="a">{WORKSPACE_ROLES.a}</option>
        </select>
      </div>
      <a className="flex-03 remove" onClick={() => this.toggleRemoveMember(member.id)}>
        <i className="far fa-trash-alt"/> {member.deleted ? 'undo remove' : 'remove'}
      </a>
    </div>);
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf board.component.Board
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    return (
      <div className="workspace-members">
        {this.renderTitle()}
        {this.renderForm()}
      </div>
    );
  }
}

WorkspaceMembers.propTypes = {
  invite: PropTypes.bool,
  company: PropTypes.object,
  users: PropTypes.object,
  dispatch: PropTypes.func,
  workspace: PropTypes.object,
  board: PropTypes.object,
};

const workspaceMembersForm = connect((state, props) => ({
  company: state.company,
}))(WorkspaceMembers);


export default workspaceMembersForm;
