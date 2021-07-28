import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, reduxForm} from 'redux-form';

// services
import l10nService from '../l10n/l10n.service';
import nestsService from './nests.service';

// actions
import {dismissDialog} from '../dialog/dialog.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from '../alerts/alert.actions';
import {addNest} from './nests.actions';
import {addWorkItems} from './../workItems/workItems.actions';

// components
import InputField from '../../components/form/inputField/inputField.component';
import Button from '../../components/button/button.component';

const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate workitem name
  if (!values.nestName) {
    errors.nestName = REQUIRED;
  }

  return errors;
};

class DuplicateNestForm extends Component {

  submit = (values) => {
    const newNest = {
      nestName: values.nestName,
    };

    this.duplicateNest(newNest);
  }

  getWorkItems(nest) {
    const workItems = {};
  
    nest.workItems.forEach(workItem => {
      const items = [];
      workItems[workItem.id] = workItem;

      // add child workItems
      nest.workItems.forEach(item => {
        if (item.idParent && workItem.id === item.idParent) {
          items.push(item.id);
        }
      });

      workItems[workItem.id].items = items;
    });
  
    return workItems;
  }

  getWorkItemsIds(nest) {
    const workItemsIds = [];
  
    nest.workItems.forEach(item => {
      if (!item.idParent) {
        workItemsIds.push(item.id);
      }
    });
  
    return workItemsIds;
  }

  handleSuccesOnDuplicateNest(nestResponseFromAPI, updatedWorkItem) {
    const {
      boardId,
      dispatch,
    } = this.props;
    const workItems = this.getWorkItems(nestResponseFromAPI);
    const nest = {
      color: null,
      id: nestResponseFromAPI.id,
      name: nestResponseFromAPI.name,
      sortedWorkItems: this.getWorkItemsIds(nestResponseFromAPI),
    };
    
    // add the new nest into the store
    dispatch(addNest(nestResponseFromAPI.id, nest));
    // save workitems into the store
    dispatch(addWorkItems(workItems));
    // remove dialog
    dispatch(dismissDialog());
    // display success alert
    dispatch(addSuccessAlert(`Your new nest ${nestResponseFromAPI.name} has been created.`));
  }

  handleFailureOnDuplicateNest(errorResponse) {
    const {dispatch} = this.props;

    // display errors
    dispatch(addDangerAlert('We cannot clone the nest at the moment. Try again in a couple of minutes.'));

    // remove dialog
    dispatch(dismissDialog());
  }

  duplicateNest(newNest) {
    const {
      boardId,
      dispatch,
      nestId,
    } = this.props;

    nestsService.duplicateNest(boardId, nestId, newNest)
      .then(response => this.handleSuccesOnDuplicateNest(response, newNest))
      .catch(error => this.handleFailureOnDuplicateNest(error));
  }

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">Clone nest</h3>
      </div>
    );
  }

  renderFormButtons() {
    return (
      <div className="bord-form-actions row">
        <div className="col-xs-12 text-center">
          <Button
            label="Clone"
            type="primary"
            shouldSubmitForm={true}
          />
        </div>
      </div>
    );
  }

  renderForm() {
    return (
      <form onSubmit={this.props.handleSubmit(this.submit)} noValidate>
        <Field
          name="nestName"
          type="text"
          component={InputField}
          placeholder="FORM.PLACEHOLDER.NEST_NAME"
        />

        {this.renderFormButtons()}
      </form>
    );
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderForm()}
      </div>
    );
  }
}

DuplicateNestForm.defaultProps = {};

DuplicateNestForm.propTypes = {
  boardId: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  nestId: PropTypes.number.isRequired,
};

export default reduxForm({
  form: 'duplicateNest',
  validate: validateFunction,
})(DuplicateNestForm);
