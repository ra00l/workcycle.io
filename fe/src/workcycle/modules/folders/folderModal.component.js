import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Field, reduxForm} from 'redux-form';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import {Treebeard} from 'react-treebeard';

// services
import l10nService from './../l10n/l10n.service';
import foldersService from './folders.service';

// actions
import {
  hideLoader,
  showLoader,
} from './../loader/loader.actions';
import {dismissDialog} from './../dialog/dialog.actions';
import {
  addFolder,
  // updateBoard,
} from './folders.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from './../alerts/alert.actions';

// components
import InputField from './../../components/form/inputField/inputField.component';
import Button from './../../components/button/button.component';

const validateFunction = (values, props) => {
  const errors = {};
  const REQUIRED = l10nService.translate('VALIDATIONS.REQUIRED');

  // validate board name
  if (!values.boardName) {
    errors.boardName = REQUIRED;
  }

  return errors;
};

class FolderModal extends Component {

  constructor() {
    super();

    this.state = {data: {}};
    this.onToggle = this.onToggle.bind(this);
  }

  componentWillMount() {
    const {
      subFolders,
      topFolders,
    } = this.props;

    const tree = this.generateTreeView('Root', null, topFolders, subFolders);
    tree.toggled = true;

    this.setState({
      data: tree,
    });
  }

  generateTreeView(name, identifier, topFolders, subFolders) {
    const {folderId} = this.props;
    const tree = {
      name,
      identifier,
      children: [],
    };
    
    topFolders.map((itemId) => {
      if (folderId !== itemId) {
        const folder = subFolders.get(`${itemId}`);

        const treeItem = this.generateTreeView(
          folder.get('name'),
          folder.get('id'),
          folder.get('subFolders'),
          subFolders
        );

        tree.children.push(treeItem);
      }
    });

    return tree;
  }

  onToggle(node, toggled) {
    const {cursor} = this.state;

    if (cursor) {
      cursor.active = false;
    }

    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }

    this.setState({cursor: node});
  }

  submit = (values) => {
    const {
      boardId,
      workspaceId,
      dispatch,
      editMode,
    } = this.props;
    const {cursor} = this.state;

    const folder = {
      name: values.name,
      type: this.props.type,
      idParent: cursor && cursor.identifier ? cursor.identifier : null,
    };

    dispatch(showLoader());

    // if (editMode) {
    //   boardsService.updateBoard(workspaceId, boardId, board)
    //     .then(response => this.handleSuccesOnEditBoard(boardId, board))
    //     .catch(error => this.handleFailureOnCreateFolder(error));
    // } else {
    foldersService.createFolder(workspaceId, folder)
      .then(response => this.handleSuccesOnCreateFolder(response, folder))
      .catch(error => this.handleFailureOnCreateFolder(error));
    // }
  }

  handleSuccesOnCreateFolder(apiResponse, folder) {
    const {dispatch} = this.props;

    dispatch(addFolder({
      ...apiResponse,
      ...folder,
    }));
    dispatch(dismissDialog());
    dispatch(hideLoader());
    dispatch(addSuccessAlert(`Your folder ${folder.name} has been created.`));
  }

  // handleSuccesOnEditBoard(boardId, board) {
  //   const {dispatch} = this.props;

  //   dispatch(updateBoard(boardId, board));
  //   dispatch(dismissDialog());
  //   dispatch(hideLoader());
  //   dispatch(addSuccessAlert(`Your board ${board.name} has been updated.`));
  // }

  handleFailureOnCreateFolder(error) {
    const {dispatch} = this.props;

    dispatch(hideLoader());
    dispatch(addDangerAlert('Something went wrong. Try again in a couple of minutes.'));
  }

  handleCancelCreateFolder = () => {
    const {dispatch} = this.props;
    dispatch(dismissDialog());
  }

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">{l10nService.translate('FOLDERS.FOLDER.SETUP')}</h3>
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
            onClick={this.handleCancelCreateFolder}
            type="link"
          />
        </div>
      </div>
    );
  }

  renderForm() {
    const {data: stateData, cursor} = this.state;
    const style = {
      tree: {
        base: {
          listStyle: 'none',
          backgroundColor: 'transparent',
          margin: 0,
          padding: 0,
          color: '#9DA5AB',
          fontFamily: 'lucida grande ,tahoma,verdana,arial,sans-serif',
          fontSize: '14px',
          display: 'inline-block',
        },
        node: {
          base: {
            position: 'relative',
          },
          link: {
            cursor: 'pointer',
            position: 'relative',
            padding: '0px 5px',
            display: 'block',
          },
          activeLink: {
            background: '#eff6ff',
            boardRadius: '5px',
          },
          toggle: {
            base: {
              position: 'relative',
              display: 'inline-block',
              verticalAlign: 'top',
              marginLeft: '-5px',
              height: '24px',
              width: '24px',
            },
            wrapper: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              margin: '-7px 0 0 -7px',
              height: '14px',
            },
            height: 14,
            width: 14,
            arrow: {
              fill: '#9DA5AB',
              strokeWidth: 0,
            },
          },
          header: {
            base: {
              display: 'inline-block',
              verticalAlign: 'top',
              color: '#9DA5AB',
            },
            connector: {
              width: '2px',
              height: '12px',
              borderLeft: 'solid 2px black',
              borderBottom: 'solid 2px black',
              position: 'absolute',
              top: '0px',
              left: '-21px',
            },
            title: {
              lineHeight: '24px',
              verticalAlign: 'middle',
            },
          },
          subtree: {
            listStyle: 'none',
            paddingLeft: '19px',
          },
          loading: {
            color: '#E2C089',
          },
        },
      },
    };

    return (
      <form onSubmit={this.props.handleSubmit(this.submit)} noValidate>
        <Field
          name="name"
          type="text"
          component={InputField}
          placeholder="FORM.PLACEHOLDER.FULL_FOLDER_NAME"
        />

        { /* where to save to folder */ }
        <div>
          <h4>Create in specific folder</h4>
          <div>Selected folder: <b>{cursor ? cursor.name : 'None'}</b></div>
          <div className="select-folder">
            <Treebeard
              data={stateData}
              onToggle={this.onToggle}
              style={style}
            />
          </div>
        </div>

        {this.renderFormButtons()}
      </form>
    );
  }

  render() {
    return (
      <div className="board-create">
        {this.renderTitle()}
        {this.renderForm()}
      </div>
    );
  }
}

FolderModal.defaultProps = {
  editMode: false,
};

FolderModal.propTypes = {
  boardId: PropTypes.number,
  editMode: PropTypes.bool,
  dispatch: PropTypes.func,
  initialValues: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  workspaceId: PropTypes.number.isRequired,
  type: PropTypes.number,
  topFolders: PropTypes.object.isRequired,
  subFolders: PropTypes.object.isRequired,
  folderId: PropTypes.number,
};

let folderForm = reduxForm({
  form: 'board',
  validate: validateFunction,
})(FolderModal);

folderForm = connect((state, props) => {
  const companyStore = state.company;
  const boardsStore = state.boards;
  const foldersStore = state.folders;
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;
  const {boardId} = props;

  const board = boardsStore.getIn(['data', `${boardId}`]) || Map();

  const initialValues = {
    boardName: board.get('name') || '',
    boardDescription: board.get('description') || '',
  };

  return {
    initialValues,
    workspaceId,
    topFolders: foldersStore.get('sortedFolders'),
    subFolders: foldersStore.get('data'),
  };
})(folderForm);

export default folderForm;
