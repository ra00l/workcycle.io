/**
 * @namespace workspace.people.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {WORKSPACE_ROLES} from '../../settings/settings.constants';

// services
import l10nService from '../../l10n/l10n.service';
import boardService from './board.service';

// routes

// actions
import {
  hideLoader,
  showLoader,
} from '../../loader/loader.actions';
import {dismissDialog} from '../../dialog/dialog.actions';
import {
  addDangerAlert, addInfoAlert,
  addSuccessAlert,
} from '../../alerts/alert.actions';

// components
import Button from '../../../components/button/button.component';
import {renderUserIcon} from '../../users/user.helper';

/**
 * @private
 * @description Prefix for logging
 * @memberOf board.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[board.members.component]';

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
class BoardMembers extends Component {

  state = {
    members: [],
    hasOwnSecurity: null,
    errorMessage: null,
    allMembers: [],
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
      board,
      company: {
        lastWorkspace,
      },
    } = this.props;

    boardService.getBoardMembers(lastWorkspace, board.get('id'))
      .then(response => {
        this.setState({
          members: response.currentMembers,
          allMembers: response.allMembers,
          hasOwnSecurity: response.boardAccessType !== 0,
        });
      })
      .catch(error => {
        this.setState({errorMessage: 'Canot get board members!'});
      });
  }

  /**
   * Success callback when the create board is resolved
   *
   * @instance
   * @memberOf board.component.Board
   * @method handleSuccesOnChangeMembers
   *
   * @param {Object} apiResponse - the response of the api
   * @param {Object} board - the board object
   */
  handleSuccesOnChangeMembers(apiResponse) {
    const {dispatch} = this.props;

    dispatch(dismissDialog());
    dispatch(hideLoader());

    dispatch(addSuccessAlert('Permissions were updated successfully!'));
  }

  /**
   * Failure callback when the create board is rejected
   *
   * @instance
   * @memberOf workspace.component.Board
   * @method handleFailureOnChangeMembers
   */
  handleFailureOnChangeMembers(error) {
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('There was an error saving the boards members. Try again in a couple of minutes.'));
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
  updateBoardMembers() {
    const {
      company: {
        lastWorkspace,
      },
      board,
      dispatch,
    } = this.props;

    if (this.state.members.filter(m => !m.deleted).length === 0) {
      return dispatch(addDangerAlert(
        'Board cannot be left with no members!'
      ));
    }
    if (this.state.members.filter(m => m.newRole === 'a' || m.role === 'a').length === 0) {
      return dispatch(addDangerAlert('Board should have at least 1 admin!'));
    }

    const members = this.state.members.filter(m => m.deleted || !!m.newRole); // added / deleted / role changed

    if (members.length === 0) {
      return dispatch(addInfoAlert('No changes to save!'));
    }

    dispatch(showLoader());

    const boardData = {
      hasOwnSecurity: this.state.hasOwnSecurity,
      members: members.map(m => ({id: m.id, role: m.newRole || m.role, deleted: m.deleted})),
    };

    boardService.updateBoardMembers(lastWorkspace, board.get('id'), boardData)
      .then(response => this.handleSuccesOnChangeMembers(response, boardData))
      .catch(error => this.handleFailureOnChangeMembers(error));
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

  addPersonToList(evt) {
    evt.preventDefault();

    const formData = evt.target.elements;
    const members = this.state.members.slice();
    const userId = +formData.userId.value;
    const role = formData.role.value;

    const user = this.state.allMembers.find(m => m.id === userId);

    if (formData.userId.value === '') {
      return this.setState({errorMessage: 'Please select a user'});
    }
    this.setState({errorMessage: ''});

    members.push({
      id: userId,
      newRole: role,
      isNew: true,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    });
    this.setState({members: members});

    formData.userId.value = '';
    formData.role.value = 'r';

    return false;
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
            label="Update members"
            type="primary"
            onClick={this.updateBoardMembers.bind(this)}
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

    const formClasses = classnames('form-group flex', {});

    const showError = () => {
      if (this.state.errorMessage)
        return (<p className="error-text">{this.state.errorMessage}</p>);
      return null;
    };

    const visibleMembers = this.state.members.sort((a, b) => a.id > b.id);
    const visibleMemberIds = this.state.members.map(m => m.id);
    const selectableMembers = this.state.allMembers.filter(m => visibleMemberIds.indexOf(m.id) === -1);

    let membersMarkup = (<div>
      <div>
        <form
          onSubmit={this.addPersonToList.bind(this)}
          noValidate
          className={formClasses}
        >
          <select className="form-control flex-1 userId" name="userId" defaultValue={''}>
            <option value="">-- select a member --</option>
            {selectableMembers.map(m => (<option value={m.id} key={m.id}>{m.name} ({m.email})</option>))}
          </select>
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
      </div>
      {visibleMembers.map(m => this.renderMember(m))}
    </div>);

    let buttonsMarkup = false;
    if (!this.state.hasOwnSecurity) {
      membersMarkup = (<h3 className="text-center">This board is a public</h3>);
    } else {
      buttonsMarkup = this.renderFormButtons();
    }

    return (
      <div>
        <div className="board-header flex">
          <h3 className="text--bold flex-1">
            Manage members access
          </h3>
          <label className="flex-1 text-right">
            <input
              type="checkbox"
              defaultChecked={this.state.hasOwnSecurity}
              onChange={(evt) => this.setState({hasOwnSecurity: evt.target.checked})}
            />&nbsp;&nbsp;
            This board is private
          </label>
        </div>

        {membersMarkup}

        {buttonsMarkup}
      </div>
    );
  }

  toggleRemoveMember(memberId) {
    const members = this.state.members;
    const memberToRem = members.find(m => m.id === memberId);

    if (memberToRem.isNew) { // newly added member
      const toRemIdx = members.findIndex(m => m.id === memberId);
      if (toRemIdx > -1) {
        members.splice(toRemIdx, 1);
      }
    } else { // existing member, keep with flag
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
        {this.renderForm()}
      </div>
    );
  }
}

BoardMembers.propTypes = {
  company: PropTypes.object,
  dispatch: PropTypes.func,
  board: PropTypes.object,
};

const boardMembersForm = connect((state, props) => ({
  company: state.company,
}))(BoardMembers);


export default boardMembersForm;
