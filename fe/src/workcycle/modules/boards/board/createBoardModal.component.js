import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {reduxForm} from 'redux-form';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import browserUtilService from '../../../services/browser.util.service';
import Checkbox from 'material-ui/Checkbox';

// // services
import l10nService from './../../l10n/l10n.service';
import boardsService from './../../boards/boards.service';

// // actions
import {
  hideLoader,
  showLoader,
} from './../../loader/loader.actions';
import {dismissDialog} from './../../dialog/dialog.actions';
import {addBoard} from './../../boards/boards.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from './../../alerts/alert.actions';

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
    selectedTemplateCategory: null,
    selectedTemplate: null,
    templates: [],
    search: '',
    withWorkItems: true,
  }

  componentWillMount() {
    const {
      workspaceId,
      dispatch,
    } = this.props;

    boardsService.getAvailableTemplates(workspaceId)
      .then(response => {
        this.setState({templates: this.generateTemplatesNav(response)});
      })
      .catch(error => {
        browserUtilService.error('Error loading templates', error);
        dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
      });
  }

  generateTemplatesNav(templatesArray) {
    let templates = [];
    const rootTemplates = templatesArray.filter(item => !item.idParent);

    templates = [...rootTemplates];

    templates.forEach(rootTemplate => {
      const filteredTemplate = templatesArray.filter(item => item.idParent === rootTemplate.id);

      rootTemplate.children = [...filteredTemplate];
    });

    return templates;
  }

  selectTemplateFromCategory = (templateCategory, template) => {
    this.setState({
      selectedTemplate: template,
      selectedTemplateCategory: templateCategory,
    });
  }

  useThisTemplate = () => {
    const {
      selectedTemplateCategory,
      selectedTemplate,
      withWorkItems,
    } = this.state;

    let name = '';
    let idTemplate = '';

    if (selectedTemplate) {
      name = selectedTemplate.name;
      idTemplate = selectedTemplate.id;
    }

    this.createNewBoard({
      name,
      idTemplate,
      idTemplateCategory: selectedTemplateCategory.id,
      withWorkItems,
    });
  }

  newBlankBoard = () => {
    // name: 'New Board'
    this.createNewBoard({
      name: 'New Board',
    });
  }

  createNewBoard(boardPayload) {
    const {
      workspaceId,
      dispatch,
      workspaceRole,
    } = this.props;

    const boardOject = {
      description: '',
      doneField: null,
      doneValue: null,
      boardAccessType: 0,
      role: workspaceRole,
      ...boardPayload,
    };

    // create board
    dispatch(showLoader());

    boardsService.createBoard(workspaceId, boardOject)
      .then(response => this.handleSuccesOnCreateBoard(response, boardOject))
      .catch(error => this.handleFailureOnCreateBoard(error));
  }

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

  handleFailureOnCreateBoard(error) {
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
  }

  renderNavigation() {
    const {
      selectedTemplateCategory,
      selectedTemplate,
      templates,
    } = this.state;

    const navigationMarkup = templates.map((templateCategory) => {
      const htmlMarkup = [];
      let filteredTemplates = templateCategory.templates;
      if (this.state.search) {
        filteredTemplates = templateCategory.templates.filter(c => c.name.toLowerCase().indexOf(this.state.search.toLowerCase()) > -1);
      }

      if (filteredTemplates.length === 0) return false;

      htmlMarkup.push((<h3>{templateCategory.name}</h3>));

      filteredTemplates.map(template => {
        const classStringCategory = classnames('template', {
          'selected': (selectedTemplateCategory && template && selectedTemplateCategory.id === templateCategory.id && template.id === selectedTemplate.id),
        });
        htmlMarkup.push(
          <a
            key={`TEMPLATE_CATEGORY_${templateCategory.id}_${template.id}`}
            className={classStringCategory}
            onClick={() => this.selectTemplateFromCategory(templateCategory, template)}
          >
            {template.name}
          </a>
        );
      });

      return htmlMarkup;
    });

    return (
      <div className="navigation">
        {navigationMarkup}
      </div>
    );
  }

  // TODO: add new blank board action
  renderNewBlankBoardButton() {
    return (
      <div className="new-empty-board">
        <button type="button" className="button button--primary" onClick={this.newBlankBoard}>New Blank Board</button>
      </div>
    );
  }

  renderFields(fieldsArray) {
    const arrayOfFields = ['Title'];

    fieldsArray.forEach(field => {
      if (field.id !== 'TITLE') {
        arrayOfFields.push(field.name);
      }
    });

    return (
      <div>
        <span className="text--semi-bold">Fields that will be created by default: </span><br/>
        {arrayOfFields.join(', ')}
      </div>
    );
  }

  renderTemplateSearch() {
    return (
      <div className="template-search form-group">
        <input
          type="text"
          value={this.state.search}
          onChange={(e) => this.setState({search: e.target.value})}
          className="form-control"
          placeholder="search ..."
        />
      </div>
    );
  }

  render() {
    const {
      selectedTemplateCategory,
      selectedTemplate,
    } = this.state;

    let actionsMarkup = null;
    if (selectedTemplate) {
      actionsMarkup = (<div className="create-board-actions flex-03">
        <Checkbox
          label="Create with work items"
          checked={this.state.withWorkItems}
          onCheck={(evt, checked) => this.setState({withWorkItems: checked})}
        />
        <button
          type="button"
          className="button button--primary"
          onClick={this.useThisTemplate}
        >
          Use this template
        </button>
      </div>);
    }

    return (
      <div className="create-new-board-modal">
        <div className="templates-navigation">
          {this.renderTemplateSearch()}
          {this.renderNavigation()}
          {this.renderNewBlankBoardButton()}
        </div>
        <div className="templates-preview">
          <div className="title">{selectedTemplate === null ? 'Choose a template' : `${selectedTemplateCategory.name}  / ${selectedTemplate.name}`}</div>
          <div
            className="preview"
            dangerouslySetInnerHTML={{__html: selectedTemplate && selectedTemplate.description ? selectedTemplate.description : '<img class="default" src="/assets/images/board_wizzard.svg" />'}}
          />
          <div className="template-detail-action">
            <div className="list-of-fields flex-1">
              {
                selectedTemplate && selectedTemplate.structure ?
                  this.renderFields(selectedTemplate.structure) :
                  false
              }
            </div>
            {actionsMarkup}
          </div>
        </div>
      </div>
    );
  }
}

BoardModal.defaultProps = {};

BoardModal.propTypes = {
  dispatch: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  workspaceId: PropTypes.number.isRequired,
  workspaceRole: PropTypes.string,
};

let boardForm = reduxForm({
  form: 'board',
  validate: validateFunction,
})(BoardModal);

boardForm = connect((state, props) => {
  const companyStore = state.company;
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;

  const userDataStore = state.auth.userInfo;
  const workspaceRole = userDataStore && userDataStore.workspaceRole;

  return {
    workspaceId,
    workspaceRole,
  };
})(boardForm);

export default boardForm;
