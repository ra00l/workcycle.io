/**
 * @namespace goalMembers.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field} from 'redux-form';
import classnames from 'classnames';

// components
import Button from '../../components/button/button.component';

// services
import l10nService from '../l10n/l10n.service';

/**
 * @private
 * @description Prefix for logging
 * @memberOf goalMembers.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[goalMembers.component]';

/**
 * Board Members component
 *
 * @class BoardMembers
 * @memberOf boardMembers.component
 * @extends React.Component
 *
 * @example
 * <BoardMembers />
 */
class GoalMembers extends Component {

  /**
   * Component internal state
   * @memberOf boardMembers.component.BoardMembers
   * @const {Object}
   * @default
   */
  state = {
    memberEmailAddress: '',
  };

  /**
   * Return the class string for the members container
   *
   * @instance
   * @memberOf boardMembers.component.BoardMembers
   * @method getContainerClassString
   *
   * @return {String}
   */
  getContainerClassString() {
    const {
      meta: {
        submitFailed,
        error,
      },
    } = this.props;

    return classnames('members-list form-group', {
      'form-group--error': submitFailed && error,
    });
  }

  /**
   * Handler for the add new member
   *
   * @instance
   * @memberOf boardMembers.component.BoardMembers
   * @method handleAddMember
   */
  handleAddMember = () => {
    const {fields} = this.props;
    const {memberEmailAddress} = this.state;

    // add new member to the list
    if (memberEmailAddress) {
      fields.push({
        email: memberEmailAddress,
        permission: 'CAN_VIEW',
      });
    }

    this.updateComponentState({
      memberEmailAddress: '',
    });
  }

  /**
   * Change handler for member email address input
   *
   * @instance
   * @memberOf boardMembers.component.BoardMembers
   * @method handleOnChangeMemberEmailAddress
   *
   * @param {Object} evt - change event
   */
  handleOnChangeMemberEmailAddress = (evt) => {

    this.updateComponentState({
      memberEmailAddress: evt.target.value,
    });
  }

  /**
   * Update component state
   *
   * @instance
   * @memberOf boardMembers.component.BoardMembers
   * @method updateComponentState
   *
   * @param {Object} newState - the new component state
   */
  updateComponentState(newState = {}) {
    this.setState(newState);
  }

  /**
   * Render add member field
   *
   * @instance
   * @memberOf goalMembers.component.GoalMembers
   * @method renderAddMemberField
   *
   * @return {Object} JSX HTML Content
   */
  renderAddMemberField() {

    return (
      <div className="members-field">
        <span className="members-field-label">{l10nService.translate('GOALS.GOAL.PEOPLE')}</span>

        <div className="members-field-body">
          <div className="form-group">
            <input
              id="add-member"
              className="form-control"
              placeholder={l10nService.translate('FORM.PLACEHOLDER.EMAIL_OR_NAME')}
              type="text"
              onChange={this.handleOnChangeMemberEmailAddress}
              value={this.state.memberEmailAddress}
              autoComplete="off"
            />
          </div>
          <div>
            <Button
              label={l10nService.translate('BUTTONS.ADD_MEMBER')}
              icon="plus"
              onClick={this.handleAddMember}
              type="secondary"
            />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render members email
   *
   * @instance
   * @memberOf goalMembers.component.GoalMembers
   * @method renderMemberEmail
   *
   * @param {Object} member - members object
   * @return {Object} JSX HTML Content
   */
  renderMemberEmail = (member) => {
    const {input} = member;

    return (
      <span className="text--bold">{input.value}</span>
    );
  }

  /**
   * Render members permission
   *
   * @instance
   * @memberOf goalMembers.component.GoalMembers
   * @method renderMemberPermission
   *
   * @param {Object} member - members object
   * @return {Object} JSX HTML Content
   */
  renderMemberPermission = (member) => {
    const {input} = member;

    return (
      <span className="text--italic text--semi-bold text--info">
        {l10nService.translate(`GOALS.GOAL.PERMISSION.${input.value}`)}
      </span>
    );
  }

  /**
   * Render members method
   *
   * @instance
   * @memberOf goalMembers.component.GoalMembers
   * @method renderMembers
   *
   * @return {Object} JSX HTML Content
   */
  renderMembers() {
    const {fields} = this.props;

    if (fields.length) {
      return fields.map((member, index) => (
        <li key={index} className="members-list-item">
          <Field
            name={`${member}.email`}
            type="text"
            component={this.renderMemberEmail}
          />
          <Field
            name={`${member}.permission`}
            type="text"
            component={this.renderMemberPermission}
          />
          <span className="text--secondary" onClick={() => fields.remove(index)}>
            <i className="fa fa-times-circle" />
          </span>
        </li>
      ));
    }

    return (
      <li key="NO_ITEMS" className="members-list-item">{l10nService.translate('GOALS.GOAL.NO_MEMBERS')}</li>
    );
  }

  /**
   * Render error field message
   *
   * @instance
   * @memberOf goalMembers.component.GoalMembers
   * @method renderError
   *
   * @return {Object | Boolean} JSX HTML Content | false
   */
  renderError() {
    const {
      meta: {
        submitFailed,
        error,
      },
    } = this.props;

    if (submitFailed && error) {
      return (
        <span className="error">{error}</span>
      );
    }

    return false;
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf goalMembers.component.GoalMembers
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    return (
      <div>
        {this.renderAddMemberField()}

        <div className={this.getContainerClassString()}>
          <div className="members-list-title text--secondary text--italic">
            {l10nService.translate('GOALS.GOAL.ACCESS_BY')}
          </div>
          <ul className="list-unstyled members-list-items">
            {this.renderMembers()}
          </ul>

          {this.renderError()}
        </div>
      </div>
    );
  }
}

GoalMembers.propTypes = {
  fields: PropTypes.object,
  meta: PropTypes.object,
};

export default GoalMembers;
