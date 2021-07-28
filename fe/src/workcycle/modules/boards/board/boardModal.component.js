import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, FieldArray, reduxForm, change, registerField} from 'redux-form';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {Map} from 'immutable';

// services
import l10nService from './../../l10n/l10n.service';
import boardsService from './../../boards/boards.service';

// routes

// actions
import {
  hideLoader,
  showLoader,
} from './../../loader/loader.actions';
import {dismissDialog} from './../../dialog/dialog.actions';
import {
  addBoard,
  updateBoard,
} from './../../boards/boards.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from './../../alerts/alert.actions';
import {updateGoal} from './../../goals/goals.actions';

// components
import BoardMembers from './board.members.component';
import InputField from './../../../components/form/inputField/inputField.component';
import Button from './../../../components/button/button.component';
import SelectField from '../../../components/form/selectField/selectField.component';
import {browserHistory} from 'react-router';
import WorkcycleEditor from '../../common/editor.component';
import editorService from '../../common/editor.service';

const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate board name
  if (!values.boardName) {
    errors.boardName = REQUIRED;
  }

  return errors;
};

class BoardModal extends Component {

  state = {
    templateId: '',
    templateOptions: [],
    doneField: null,
    doneValue: null,
    visibleTab: 'info',
    boardFields: [],
    editorState: editorService.getState(null),
  };

  componentWillMount() {

    const {
      workspaceId,
      board,
      dispatch,
      isGoal,
      editMode,
    } = this.props;

    this.setState({editorState: editorService.getState(board.get('description') || '')});

    if (!editMode) {
      boardsService.getAvailableTemplates(workspaceId)
        .then(response => {
          const opts = [];
          for (const tpl of response) {
            opts.push({value: tpl.id, label: tpl.name});
          }
          this.setState({templateOptions: opts});
        })
        .catch(error => {
          dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
        });
    } else {
      boardsService.getBoardFields(workspaceId, board.get('id'), isGoal)
        .then(response => {
          const doneField = this.props.board.get('doneField');
          const doneValue = this.props.board.get('doneValue');

          this.setState({boardFields: response, doneField: doneField, doneValue: doneValue});
        })
        .catch(error => false);
    }
  }

  editorStateChanged(editorState) {
    this.setState({editorState: editorState});
  }

  submit = (values) => {
    const {
      boardId,
      workspaceId,
      dispatch,
      isGoal,
      editMode,
    } = this.props;

    const descriptionMeta = editorService.getEditorData(this.state.editorState.getCurrentContent());

    const board = {
      name: values.boardName,
      description: descriptionMeta.html,
      members: values.members,
      idTemplate: this.state.templateId,
      doneField: this.state.doneField,
      doneValue: this.state.doneValue,
    };

    dispatch(showLoader());

    if (editMode) {
      boardsService.updateBoard(workspaceId, boardId, board, isGoal)
        .then(response => this.handleSuccesOnEditBoard(boardId, board))
        .catch(error => this.handleFailureOnCreateBoard(error));
    } else {
      boardsService.createBoard(workspaceId, board)
        .then(response => this.handleSuccesOnCreateBoard(response, board))
        .catch(error => this.handleFailureOnCreateBoard(error));
    }
  };

  handleSuccesOnCreateBoard(apiResponse, board) {
    const {dispatch} = this.props;

    dispatch(addBoard({
      ...apiResponse,
      ...board,
    }));
    dispatch(dismissDialog());
    dispatch(hideLoader());
    dispatch(addSuccessAlert(`Your board ${board.name} has been created.`));

    browserHistory.push(`/${this.props.workspaceId}/boards/${apiResponse.id}`);
  }

  handleSuccesOnEditBoard(boardId, board) {
    const {dispatch, isGoal} = this.props;

    dispatch(updateBoard(boardId, board));

    if (isGoal) {
      dispatch(updateGoal(boardId, board));
      dispatch(addSuccessAlert(`Your goal ${board.name} has been updated.`));
    }

    dispatch(dismissDialog());
    dispatch(hideLoader());
    if (!isGoal) {
      dispatch(addSuccessAlert(`Your board ${board.name} has been updated.`));
    }
  }

  handleFailureOnCreateBoard(error) {
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
  }

  handleCancelCreateBoard = () => {
    const {dispatch} = this.props;
    dispatch(dismissDialog());
  };

  renderTitle() {
    const {visibleTab} = this.state;
    const {isGoal} = this.props;

    const infoClass = classnames('tab', {
      'tab-selected': visibleTab === 'info',
    });

    const membersClass = classnames('tab', {
      'tab-selected': visibleTab === 'members',
    });

    return (
      <div className="board-header">
        <h3 className="text--bold">
          {isGoal ? l10nService.translate('GOALS.GOAL.SETUP') : l10nService.translate('BOARDS.BOARD.SETUP')}
        </h3>

        <div className="flex-center-space-evenly">
          <div className="tabs">
            {
              !isGoal ?
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

  renderDescriptionField(formField) {
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

  setTemplate(val) {
    this.setState({templateId: val});
  }

  doneFieldChanged(args) {
    this.setState({doneField: args.target.value});
  }

  renderForm() {
    const {editMode, isGoal} = this.props;

    let selectTemplate = null;
    if (!editMode) {
      selectTemplate = (<SelectField
        clearable={true}
        options={this.state.templateOptions}
        placeholder="Please select a template or leave blank"
        onChangeHandler={this.setTemplate.bind(this)}
        selectedValue={this.state.templateId}
      />);
    }

    const selectableDoneFields = this.state.boardFields.filter(f => f.type === 'selector' || f.type === 'percentage');

    let doneField = null;
    let doneValue = null;

    if (this.state.boardFields.length > 0) {
      doneField = (<div className="form-group">
        <label>Done field</label>
        <select
          className="form-control"
          name="doneField"
          onChange={this.doneFieldChanged.bind(this)}
          defaultValue={this.state.doneField}
        >
          <option value="">-- select --</option>
          {selectableDoneFields.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
        </select>
      </div>);
    }

    if (this.state.doneField) {
      const field = this.state.boardFields.find(f => f.id === this.state.doneField);
      if (field.type === 'selector') {
        doneValue = (<div className="form-group">
          <label>Done value</label>
          <select
            className="form-control"
            name="role"
            defaultValue={this.state.doneValue}
            onChange={e => this.setState({doneValue: e.target.value})}
          >
            {(field.meta || []).map(b => (<option key={b.id} value={b.id}>{b.label}</option>))}
          </select>
        </div>);
      } else if (field.type === 'percentage') {
        doneValue = (<div className="form-group">
          <label>Done value</label>
          <input
            className="form-control"
            name="role"
            defaultValue={100}
            disabled={true}
          />
        </div>);
      }
    }

    return (
      <form onSubmit={this.props.handleSubmit(this.submit)} noValidate>
        {selectTemplate}
        <Field
          name="boardName"
          type="text"
          component={InputField}
          placeholder="FORM.PLACEHOLDER.FULL_BOARD_NAME"
        />

        <Field name="workitemDescription" component={this.renderDescriptionField.bind(this)}/>

        <div className="alert alert-info">
          Select below what field and what value should we consider for your
          work item from this board to be considered completed and
          fully automate the connections / dependencies with other boards and goals
        </div>

        {doneField}
        {doneValue}

        {this.renderFormButtons()}
      </form>
    );
  }

  renderInfoTab() {
    if (this.state.visibleTab === 'info') {
      return (
        <div className="info-tab">
          {this.renderForm()}
        </div>
      );
    }
    return null;
  }

  renderMembersTab() {
    if (this.state.visibleTab === 'members' && !this.props.isGoal) {
      const {board} = this.props;
      return (<div>
        <BoardMembers board={board}/>
      </div>);
    }
    return null;
  }

  render() {
    return (
      <div className="board-create">
        {this.renderTitle()}

        {this.renderInfoTab()}
        {this.renderMembersTab()}
      </div>
    );
  }
}

BoardModal.defaultProps = {
  editMode: false,
  isGoal: false,
};

BoardModal.propTypes = {
  boardId: PropTypes.number,
  editMode: PropTypes.bool,
  dispatch: PropTypes.func,
  isGoal: PropTypes.bool,
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  workspaceId: PropTypes.number.isRequired,
  board: PropTypes.object,
};

let boardForm = reduxForm({
  form: 'board',
  validate: validateFunction,
})(BoardModal);

boardForm = connect((state, props) => {
  const companyStore = state.company;
  const boardsStore = state.boards;
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;
  const {boardId} = props;

  const board = boardsStore.getIn(['data', `${boardId}`]) || Map();

  const initialValues = {
    boardName: board.get('name') || '',
  };

  return {
    initialValues,
    workspaceId,
    board,
  };
})(boardForm);

export default boardForm;
