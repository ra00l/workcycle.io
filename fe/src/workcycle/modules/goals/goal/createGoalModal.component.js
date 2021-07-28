import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, reduxForm} from 'redux-form';
// import classnames from 'classnames';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import moment from 'moment';
import {SingleDatePicker} from 'react-dates';

// // // services
import l10nService from './../../l10n/l10n.service';
import goalsService from './../../goals/goals.service';

// actions
import {
  hideLoader,
  showLoader,
} from './../../loader/loader.actions';
import {dismissDialog} from './../../dialog/dialog.actions';
import {addGoal} from './../../goals/goals.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from './../../alerts/alert.actions';

import InputField from './../../../components/form/inputField/inputField.component';
import Button from './../../../components/button/button.component';

import browserUtilService from '../../../services/browser.util.service';

const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate board name
  if (!values.goalName) {
    errors.goalName = REQUIRED;
  }

  return errors;
};

class CreateGoal extends Component {

  state = {
    dueDate: moment(),
    focused: false,
  }

  submit = (values) => {
    const {workspaceId} = this.props;
    const goalsObject = {
      name: values.goalName,
      dueDate: this.state.dueDate.toISOString(),
    };

    // dispatch(showLoader());

    goalsService.createGoal(workspaceId, goalsObject)
      .then(response => this.handleSuccesOnCreateGoal(response, goalsObject))
      .catch(error => this.handleFailureOnCreateGoal(error));
  }

  handleSuccesOnCreateGoal(apiResponse, goal) {
    const {dispatch} = this.props;

    dispatch(addGoal({
      ...apiResponse,
      ...goal,
    }));

    dispatch(dismissDialog());
    dispatch(hideLoader());
    dispatch(addSuccessAlert(`Your goal ${goal.name} has been created.`));

    // browserHistory.push(`/${this.props.workspaceId}/goals/${apiResponse.id}`);
  }

  handleFailureOnCreateGoal(error) {
    browserUtilService.error('error creating goal: ', error);
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
  }

  handleCancelCreateBoard = () => {
    const {dispatch} = this.props;
    dispatch(dismissDialog());
  }

  handleChange = (date) => {
    this.setState({
      dueDate: date,
    });
  }

  renderFormButtons() {
    return (
      <div className="bord-form-actions row">
        <div className="col-xs-6 text-right">
          <Button
            label={l10nService.translate('BUTTONS.SAVE')}
            type="primary"
            shouldSubmitForm={true}
          />
        </div>
        <div className="col-xs-6 text-left">
          <Button
            label={l10nService.translate('BUTTONS.CANCEL')}
            onClick={this.handleCancelCreateBoard}
            type="link"
          />
        </div>
      </div>
    );
  }

  handleFocusOnDateField = (focusedObj) => {
    const {focused} = focusedObj;

    this.setState({
      focused,
    });
  }

  renderGoalDueDate() {
    return (
      <div className="goal-dueDate">
        <div className="goal-dueDate-label">
          Complete the goal until:
        </div>
        <SingleDatePicker
          date={this.state.dueDate}
          onDateChange={this.handleChange}
          focused={this.state.focused}
          onFocusChange={this.handleFocusOnDateField}
          numberOfMonths={2}
          placeholder="&nbsp;"
          hideKeyboardShortcutsPanel
          isOutsideRange={() => false}
          // withPortal
        />
      </div>
    );
  }

  render() {
    return (
      <div className="create-new-goal-modal">
        <div className="goal-header">
          <h3 className="text--bold">{l10nService.translate('GOALS.GOAL.SETUP')}</h3>
        </div>
        <form onSubmit={this.props.handleSubmit(this.submit)} noValidate>
          <Field
            name="goalName"
            type="text"
            component={InputField}
            placeholder="FORM.PLACEHOLDER.FULL_GOAL_NAME"
          />

          {this.renderGoalDueDate()}

          {this.renderFormButtons()}
        </form>
      </div>
    );
  }
}

CreateGoal.defaultProps = {};

CreateGoal.propTypes = {
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

let goalForm = reduxForm({
  form: 'goal',
  validate: validateFunction,
})(CreateGoal);

goalForm = connect((state, props) => {
  const companyStore = state.company;
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;

  return {
    workspaceId,
  };
})(goalForm);

export default goalForm;
