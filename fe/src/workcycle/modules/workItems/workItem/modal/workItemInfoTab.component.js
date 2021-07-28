import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {browserHistory} from 'react-router';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import {Map} from 'immutable';

// // services
import l10nService from './../../../l10n/l10n.service';
import workItemService from './../workItem.service';

// // actions
import {
  hideLoader,
  showLoader,
} from '../../../loader/loader.actions';
import {dismissDialog} from '../../../dialog/dialog.actions';
import {
  updateWorkItem,
} from './../../workItems.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from '../../../alerts/alert.actions';
import {invalidateWorkItem} from './../../workItem.actions';
import {createField} from './../../../fields/fields.actions';

// // components
import InputField from '../../../../components/form/inputField/inputField.component';
import Button from '../../../../components/button/button.component';
import WorkItemCustomField from './../workItemCustomField.component';
import CustomField from './../../../fields/field.component';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import WorkcycleEditor from '../../../common/editor.component';
import editorService from '../../../common/editor.service';

const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate workitem name
  if (!values.workitemName) {
    errors.workitemName = REQUIRED;
  }

  return errors;
};

class WorkItemInfoTab extends Component {

  state = {
    openMenu: false,
    editorState: editorService.getState(null),
  };

  componentWillMount() {
    const {
      initialValues: {
        workitemDescription,
      },
    } = this.props;

    this.setState({editorState: editorService.getState(workitemDescription)});
  }

  editorStateChanged(editorState) {
    this.setState({editorState: editorState});
  }

  handleSuccesOnEditWorkitem(workItemId, updatedWorkItem) {
    const {
      boardId,
      dispatch,
      isGoal,
      workspaceId,
    } = this.props;

    dispatch(updateWorkItem(workItemId, updatedWorkItem));
    dispatch(dismissDialog());
    dispatch(hideLoader());

    if (isGoal) {
      browserHistory.push(`/${workspaceId}/goals/${boardId}`);
    } else {
      browserHistory.push(`/${workspaceId}/boards/${boardId}`);
    }

    dispatch(addSuccessAlert(l10nService.translate('WORKITEMS.WORKITEM.MESSAGES.EDIT_ITEM_WITH_SUCCESS', {
      workitemName: updatedWorkItem.title,
    })));

    // invalidate workItemStore
    dispatch(invalidateWorkItem());
  }

  handleFailureOnEditWorkitem(errorResponse) {
    const {dispatch} = this.props;
    const {errors} = errorResponse;

    dispatch(hideLoader());

    if (!errors || !errors.forEach) {
      return dispatch(addDangerAlert(l10nService.translate('WORKITEMS.WORKITEM.MESSAGES.GENERIC_ERROR')));
    }

    errors.forEach(error => {
      dispatch(addDangerAlert(l10nService.translate(`WORKITEMS.WORKITEM.MESSAGES.${error.code}`)));
    });

    if (errors.length === 0) {
      dispatch(addDangerAlert(l10nService.translate('WORKITEMS.WORKITEM.MESSAGES.GENERIC_ERROR')));
    }
  }

  editWorkItem(updatedWorkItem) {
    const {
      boardId,
      dispatch,
      workItem,
    } = this.props;

    dispatch(showLoader());

    workItemService.updateWorkItem(boardId, workItem.get('id'), updatedWorkItem)
      .then(response => this.handleSuccesOnEditWorkitem(workItem.get('id'), updatedWorkItem))
      .catch(error => this.handleFailureOnEditWorkitem(error));
  }

  submit = (values) => {
    const descriptionMeta = editorService.getEditorData(this.state.editorState.getCurrentContent());

    const workitemEntity = {
      title: values.workitemName,
      description: descriptionMeta.html || '',
      idParent: values.workItemParentId || null,
    };

    this.editWorkItem(workitemEntity);
  }

  handleCancelCreateWorkitem = () => {
    const {
      boardId,
      dispatch,
      isGoal,
      workspaceId,
    } = this.props;

    // invalidate workItem
    dispatch(dismissDialog());

    if (isGoal) {
      browserHistory.push(`/${workspaceId}/goals/${boardId}`);
    } else {
      browserHistory.push(`/${workspaceId}/boards/${boardId}`);
    }

    // invalidate workItem store
    dispatch(invalidateWorkItem());
  }

  renderDescriptionFieldError() {
    const descriptionMeta = editorService.getEditorData(this.state.editorState.getCurrentContent());

    if (descriptionMeta.html.length === 0) {
      return (
        <span className="error">This field is required!</span>
      );
    }

    return false;
  }

  isFieldVisible(field) {
    const isVisible = true;

    if (field && field.get('visibility')) {
      return field.get('visibility').get('detail');
    }

    return isVisible;
  }

  renderCustomField(field, index) {
    const {
      boardId,
      workItem,
    } = this.props;

    const fieldId = field.get('id');
    const key = `WORKITEM-FIELD-${index}-${fieldId}`;

    if (fieldId !== 'TITLE' && this.isFieldVisible(field)) {
      return (
        <div key={key} className="col-xs-12 col-sm-6 custom-field workitem-row">
          <CustomField
            boardId={boardId}
            fieldId={fieldId}
            visibleIn="DETAIL"
          />

          <WorkItemCustomField
            key={index}
            boardId={boardId}
            fieldId={fieldId}
            visibleIn="DETAIL"
            workItem={workItem}
          />
        </div>
      );
    }

    return false;
  }

  handleOnRequestChange = (value) => {
    this.setState({
      openMenu: value,
    });
  }

  handleOnItemClick = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;
    const {
      boardId,
      dispatch,
      workspaceId,
    } = this.props;
    let fieldName = value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    if (value === 'selector') {
      fieldName = 'Status';
    }

    const field = {
      originalType: value,
      type: value,
      name: fieldName,
    };

    dispatch(createField(workspaceId, boardId, field));

    this.setState({
      openMenu: false,
    });
  }

  handleOpenMenu = () => {
    this.setState({
      openMenu: true,
    });
  }

  renderAddNewField() {
    return (
      <IconMenu
        iconButtonElement={this.renderAddNewFieldTitle()}
        open={this.state.openMenu}
        onRequestChange={this.handleOnRequestChange}
        onItemClick={this.handleOnItemClick}
        className="add-new-field-type"
      >
        <MenuItem
          value="date"
          primaryText="Date"
          disabled={false}
          leftIcon={<i className="far fa-calendar-alt" style={{top: '4px'}}/>}
        />
        <MenuItem
          value="number"
          primaryText="Number"
          disabled={false}
          leftIcon={<i className="fas fa-sort-numeric-up" style={{top: '4px'}}/>}
        />
        <MenuItem
          value="short-text"
          primaryText="Short Text"
          leftIcon={<i className="fas fa-font" style={{top: '3px'}}/>}
        />
        <MenuItem
          value="person"
          primaryText="Person"
          disabled={false}
          leftIcon={<i className="fas fa-user" style={{top: '3px'}}/>}
        />
        <MenuItem
          value="timeline"
          primaryText="Timeline"
          disabled={false}
          leftIcon={<i className="fas fa-map-signs" style={{top: '4px'}}/>}
        />
        <MenuItem
          value="selector"
          primaryText="Status"
          disabled={false}
          leftIcon={<i className="far fa-check-circle" style={{top: '4px'}}/>}
        />
        <MenuItem
          value="external-link"
          primaryText="External Link"
          disabled={false}
          leftIcon={<i className="fas fa-external-link-alt" style={{top: '3px'}}/>}
        />
        <MenuItem
          value="percentage"
          primaryText="Percentage"
          disabled={false}
          leftIcon={<i className="fas fa-percent" style={{top: '4px'}}/>}
        />
        <MenuItem
          value="dependency"
          primaryText="Dependency"
          disabled={false}
          leftIcon={<i className="fas fa-sitemap" style={{top: '4px'}}/>}
        />
        {/* <MenuItem
          value="tag"
          primaryText="Label / tag"
          disabled={true}
          leftIcon={<i className="fas fa-tag" style={{top: '4px'}}/>}
        />
        <MenuItem
          value="reminder"
          primaryText="Reminder"
          disabled={true}
          leftIcon={<i className="far fa-bell" style={{top: '3px'}}/>}
        />
        <MenuItem
          value="checklist"
          primaryText="Checklist"
          disabled={true}
          leftIcon={<i className="fas fa-list" style={{top: '4px'}}/>}
        /> */}
      </IconMenu>
    );
  }

  renderAddNewFieldTitle() {
    return (
      <FlatButton
        backgroundColor="transparent"
        label="Add field"
        onClick={this.handleOpenMenu}
        icon={<i className="fas fa-plus"/>}
        style={{color: '#0095FF'}}
      />
    );
  }

  renderCustomFields() {
    const {
      fields,
      fieldOrder,
      workItem,
    } = this.props;
    const fieldsMarkup = fieldOrder.map((fieldId, index) => {
      const field = fields.get(fieldId);

      return this.renderCustomField(field, index);
    });

    const addNewFieldMarkup = this.renderAddNewField();

    return (
      <div className="row custom-fields nests-list">
        {fieldsMarkup}
        <div className="col-xs-12 add-custom-field">
          {addNewFieldMarkup}
        </div>
      </div>
    );
  }

  renderForm() {
    return (
      <form onSubmit={this.props.handleSubmit(this.submit)} noValidate>
        <Field
          name="workitemName"
          type="text"
          component={InputField}
          placeholder="FORM.PLACEHOLDER.WORKITEM_DESCRIPTION"
        />

        <Field name="workitemDescription" component={this.renderDescriptionField.bind(this)}/>

        {this.renderCustomFields()}

        {this.renderFormButtons()}
      </form>
    );
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
            onClick={this.handleCancelCreateWorkitem}
            type="link"
          />
        </div>
      </div>
    );
  }

  renderDescriptionField(formField) {
    return (
      <div className="description-field form-group">
        <span className="description-field-label">
          {l10nService.translate('FORM.LABEL.DESCRIPTION')}
        </span>

        <div className="description-field-body">
          <WorkcycleEditor editorState={this.state.editorState} onChange={this.editorStateChanged.bind(this)} disableMention={true}/>

          {this.renderDescriptionFieldError(formField)}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderForm()}
      </div>
    );
  }
}

WorkItemInfoTab.defaultProps = {
  isGoal: false,
};

WorkItemInfoTab.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  isGoal: PropTypes.bool,
  fieldOrder: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

let workItemInfoTabForm = reduxForm({
  form: 'workItem',
  validate: validateFunction,
})(WorkItemInfoTab);

workItemInfoTabForm = connect((state, props) => {
  const workItem = props.workItem || Map();

  const fieldStore = state.fields;
  const fieldOrder = fieldStore.get('sorted');
  const fields = fieldStore.get('data') || Map();

  const workitemName = workItem.get('title') || '';
  const workitemDescription = workItem.get('description') || '';
  const workItemParentId = workItem.get('idParent') || '';

  const initialValues = {
    workitemName,
    workitemDescription,
    workItemParentId,
  };

  return {
    initialValues,
    fieldOrder,
    fields,
  };
})(workItemInfoTabForm);

export default workItemInfoTabForm;
