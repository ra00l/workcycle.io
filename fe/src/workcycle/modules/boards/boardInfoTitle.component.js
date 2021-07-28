import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {browserHistory} from 'react-router';
import TimeAgo from 'react-timeago';
import classnames from 'classnames';
import moment from 'moment';
import {Map} from 'immutable';
import {SingleDatePicker} from 'react-dates';
import {RIEInput} from 'riek';

// actions
import {
  cloneBoard,
  removeBoard,
  saveBoardAsTemplate,
  moveBoard,
  updateBoard,
} from './boards.actions';
import {
  showDialog,
  showConfirmationDialog,
  dismissDialog,
} from '../dialog/dialog.actions';
import {moveBoardToFolder} from './../folders/folders.actions';
import {createField} from './../fields/fields.actions';
import {
  updateGoal,
  updateGoalDueDate,
} from './../goals/goals.actions';
import ROLE from '../../contants/role.constants';

// services
import BoardsService from './boards.service';

import BoardModal from './board/boardModal.component';

// material-ui components
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import AddIcon from 'material-ui/svg-icons/content/add';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Popover from 'material-ui/Popover';
import Dialog from 'material-ui/Dialog';
import MoveToFolder from './../folders/moveToFolder.component';
import NestModal from '../nests/nestModal.component';
import WorkItemCreateModal from '../workItems/workItem/workItemCreateModal.component';
import {renderUserIcon} from '../users/user.helper';
import browserUtilService from '../../services/browser.util.service';
import {addSuccessAlert} from '../alerts/alert.actions';
import BoardFilter from './../boardFilter/boardFilter.component';
import CloneBoardModal from './board/cloneBoardModal.component';

const AVAILABLE_STYLES = {
  '': 'Confortable',
  'compact': 'Compact',
  'table': 'Table',
};

const PROGRESS_STATE = {
  fail: {
    graph: '#FF8080',
    line: '#FFE5E5',
  },
  amber: {
    graph: '#FAA928',
    line: '#faa92866',
  },
  almost: {
    graph: '#4DA1FF',
    line: '#DCECFF',
  },
  success: {
    graph: '#19B136',
    line: '#4cd96566',
  },
};

class BoardInfoTitle extends Component {
  state = {
    styleName: '',
    isStyleMenuOpened: false,
    styleMenuRef: null,
    showMoveToFolderModal: false,
    isNotificationMenuOpened: false,
    notificationMenuRef: null,
    changeList: [],
    changeCount: 0,
    fixedHeader: false,
    isAddMenuOpened: false,
    addMenuRef: null,
    allLoaded: false,
    showDeleteModal: false,
    focusedDatePicker: false,
  };

  componentWillMount() {
    const {changeCount} = this.props.board;

    this.setState({changeCount: changeCount || 0});
    const lastStyle = localStorage[`style_${this.props.board.get('id')}`];
    if (lastStyle) {
      this.setState({styleName: lastStyle});
    }
  }

  componentDidMount() {
    this.pageYOffset = window.pageYOffset;
    this.boundingClientRect = document.getElementsByClassName('board-title-actions-section')[0].getBoundingClientRect();
    window.addEventListener('scroll', this.handleScroll);

    const lastStyle = localStorage[`style_${this.props.board.get('id')}`];
    if (lastStyle) {
      document.querySelector('.nests-list').className = `nests-list ${lastStyle}`;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  loadPageNumber = 0;
  pageYOffset = null;
  boundingClientRect = null;

  handleScroll = (event) => {
    const scroll = window.scrollY;

    if (this.boundingClientRect.top < scroll + 65) {
      this.setState({
        fixedHeader: true,
      });
    } else {
      this.setState({
        fixedHeader: false,
      });
    }
  }

  onChangeHandlerForTitle = (newChangeObject) => {
    const {
      board,
      dispatch,
      isGoal,
      workspaceId,
    } = this.props;
    const boardId = board.get('id');
    const boardObj = {
      name: newChangeObject.fieldValue,
    };

    BoardsService.updateBoard(workspaceId, boardId, boardObj, isGoal)
      .then(response => {
        dispatch(updateBoard(boardId, boardObj));

        if (isGoal) {
          dispatch(updateGoal(boardId, boardObj));
          dispatch(addSuccessAlert(`Your goal ${boardObj.name} has been updated.`));
        }
        if (!isGoal) {
          dispatch(addSuccessAlert(`Your board ${boardObj.name} has been updated.`));
        }
      })
      .catch(error => false);
  };

  remove = () => {
    const {
      board,
      dispatch,
      workspaceId,
    } = this.props;
    const boardId = board.get('id');

    BoardsService.removeBoard(workspaceId, boardId)
      .then(response => {
        dispatch(removeBoard(boardId));
        browserHistory.push(`/${workspaceId}`); // reset board if selected
        // close nodal!!!!
        this.setState({showDeleteModal: false});
      })
      .catch(err => {
        // TODO: alert something went wrong
      });
  }

  clone = (boardName, folderId) => {
    const {
      board,
      dispatch,
      workspaceId,
      isGoal,
    } = this.props;

    const boardId = board.get('id');

    if (isGoal) {
      dispatch(cloneBoard(workspaceId, boardId, isGoal));
    } else {
      dispatch(cloneBoard(workspaceId, boardId, false, folderId, boardName));
      dispatch(dismissDialog());
    }
  }

  saveTemplate = () => {
    const {
      board,
      dispatch,
      workspaceId,
    } = this.props;
    const boardId = board.get('id');

    dispatch(saveBoardAsTemplate(workspaceId, boardId));
  }

  cloneBoard = () => {
    const {
      isGoal,
      board,
      dispatch,
    } = this.props;

    if (isGoal) {
      const options = {
        closeCb: () => false,
        content: (
          <div>
            <h4 className="confirmation-message">
              Clone goal
            </h4>
            <p className="confirmation-message-detail">
              Are you sure you want to clone the following goal
              <span className="text--italic"> {this.props.board.name}</span> ?
            </p>
          </div>
        ),
      };
      const buttons = {
        clickCb: this.clone,
        label: 'Clone',
      };

      dispatch(showConfirmationDialog(options, buttons));
    } else {
      const boardId = board.id;
      const folderId = board.idFolder;

      const options = {
        closeCb: () => false,
        content: (
          <CloneBoardModal
            boardId={boardId}
            folderId={folderId}
            boardData={board}
            saveHandler={this.clone}
            cancelHandler={() => {
              const {dispatch} = this.props;
              dispatch(dismissDialog());
            }}
          />
        ),
      };
      const buttons = [];

      dispatch(showDialog(options, buttons));
    }
  }

  saveBoardAsTemplate = () => {
    const options = {
      closeCb: () => false,
      content: (
        <div>
          <h4 className="confirmation-message">Save board as template</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to save a template for this board
            <span className="text--italic"> {this.props.board.name}</span> ?
          </p>
        </div>
      ),
    };
    const buttons = {
      clickCb: this.saveTemplate,
      label: 'Save as template',
    };

    this.props.dispatch(showConfirmationDialog(options, buttons));
  };

  editBoard = () => {
    const {
      board,
      dispatch,
      isGoal,
    } = this.props;
    const boardId = board.get('id');

    const options = {
      closeCb: () => false,
      content: (
        <BoardModal
          boardId={boardId}
          isGoal={isGoal}
          editMode={true}
        />
      ),
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  moveFolder = (toFolder) => {
    const {
      board,
      workspaceId,
      dispatch,
    } = this.props;

    const boardId = board.get('id');
    const fromFolder = board.get('idFolder');

    BoardsService.updateBoard(workspaceId, boardId, {
      idFolder: toFolder,
    })
      .then(response => {
        dispatch(moveBoard(boardId, toFolder, fromFolder));
        dispatch(moveBoardToFolder(boardId, toFolder, fromFolder));

        this.setState({
          showMoveToFolderModal: false,
        });
      })
      .catch(err => {
        // TODO: alert something went wrong
        this.setState({
          showMoveToFolderModal: false,
        });
      });
  }

  handleClickOnDropdownItem = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;

    switch (value) {
      case 'REMOVE_BOARD':
        this.setState({
          showDeleteModal: true,
        });
        break;
      case 'CLONE_BOARD':
        this.cloneBoard();
        break;
      case 'COPY_BOARD_LINK':
        this.copyBoardLink();
        break;
      case 'SAVE_BOARD_TEMPLATE':
        this.saveBoardAsTemplate();
        break;
      case 'MOVE_FOLDER':
        this.setState({
          showMoveToFolderModal: true,
        });
        break;
      case 'EDIT_BOARD':
        this.editBoard();
        break;
    }
  };

  copyBoardLink() {
    const {
      board,
      dispatch,
      workspaceId,
      isGoal,
    } = this.props;

    const boardId = board.get('id');
    let message = 'Link to board copied to clipboard!';

    if (isGoal) {
      message = 'Link to goal copied to clipboard!';
      browserUtilService.copyToClipboard(browserUtilService.getAbsoluteLink(`/${workspaceId}/goals/${boardId}`));
    } else {
      browserUtilService.copyToClipboard(browserUtilService.getAbsoluteLink(`/${workspaceId}/boards/${boardId}`));
    }

    dispatch(addSuccessAlert(message));
  }

  openChangeWorkItem(id) {
    const {
      board,
      workspaceId,
    } = this.props;

    this.setState({
      isNotificationMenuOpened: false,
      notificationMenuRef: null,
      changeCount: 0,
    });

    browserHistory.push(`/${workspaceId}/boards/${board.get('id')}/item/${id}`);
  }

  renderChangeItem(item) {
    let changedMarkup = null;
    if (item.meta.new_description) { // description change
      changedMarkup = (<div>
        <p dangerouslySetInnerHTML={{__html: item.meta.new_description}} className="new-description"/>
        <p dangerouslySetInnerHTML={{__html: item.meta.old_description}} className="old-description"/>
      </div>);
    } else if (item.meta.new_order) {
      changedMarkup = (<div>changed order from {item.meta.old_order} to {item.meta.new_order}</div>);
    } else if (item.meta.fields) {
      const field = item.meta.fields[0];
      changedMarkup = (<div>changed <b>{field.fieldName || field.idField}</b>&nbsp;
        from <b>{field.oldValueName || field.oldValue}</b>&nbsp;
        to <b>{field.newValueName || field.newValue}</b>
      </div>);
    } else if (item.meta.new_title) {
      changedMarkup = (<div>changed <b>title</b> from <b>{item.meta.old_title}</b>&nbsp;
        to <b>{item.meta.new_title}</b>
      </div>);
    } else if (item.meta.new_idNest) {
      changedMarkup = (<div>changed <b>nest</b> from <b>{item.meta.old_idNest}</b>&nbsp;
        to <b>{item.meta.new_idNest}</b>
      </div>);
    } else {
      changedMarkup = (<pre>{JSON.stringify(item.meta)}</pre>);
    }

    const UPDATE_ACTION = {
      WorkItemCreated: 1,
      WorkItemModified: 2,
      WorkItemFieldsModified: 3,
      WorkItemDeleted: 4,
      WorkItemCommentAdded: 5,
      WorkItemFilesAdded: 6,
    };
    let actionText = '';
    let actionClass = 'action ';
    if (item.updateType === UPDATE_ACTION.WorkItemCreated) {
      actionText = 'created';
      actionClass += 'created';
      changedMarkup = null;
    } else if (item.updateType === UPDATE_ACTION.WorkItemDeleted) {
      actionText = 'deleted';
      actionClass += 'deleted';
      changedMarkup = null;
    } else if (item.updateType === UPDATE_ACTION.WorkItemModified ||
      item.updateType === UPDATE_ACTION.WorkItemFieldsModified) {
      actionText = 'modified';
      actionClass += 'modified';
    } else if (item.updateType === UPDATE_ACTION.WorkItemCommentAdded) {
      actionText = 'commented on';
      actionClass += 'commented';
      changedMarkup = null;
    } else if (item.updateType === UPDATE_ACTION.WorkItemFilesAdded) {
      actionText = 'added files to';
      actionClass += 'added-files';
      changedMarkup = null;
    }

    return (<div
      key={item.id}
      className="work-item-change-history"
      onClick={this.openChangeWorkItem.bind(this, item.idWorkItem)}
    >
      <div className="pull-left userIcon">
        {renderUserIcon(item.user.name, item.user.img)}
        <span className={actionClass}>{actionText}</span>
      </div>
      <div className="pull-right"><TimeAgo date={item.createdAt}/></div>
      <div className="clearfix"/>
      <h3 className="text-center title">{item.meta.title}</h3>
      {changedMarkup}
    </div>);
  }

  handleStyleChange(proxy, value) {
    document.querySelector('.nests-list').className = `nests-list ${value}`; // todo: restore original class name!
    this.setState({styleName: value, isStyleMenuOpened: false, styleMenuRef: null});
    localStorage[`style_${this.props.board.get('id')}`] = value;
  }

  openStyleMenu(event) {
    this.setState({isStyleMenuOpened: true, styleMenuRef: event.currentTarget});
  }

  closeStyleMenu() {
    this.setState({isStyleMenuOpened: false});
  }

  closeMoveToFolderModal = () => {
    this.setState({
      showMoveToFolderModal: false,
    });
  }

  renderMoveToFolderModal() {
    if (!this.state.showMoveToFolderModal) {
      return null;
    }

    return (
      <Dialog
        modal={false}
        open={true}
        onRequestClose={this.closeMoveToFolderModal}
        className="move-to-folder-material-modal"
      >
        <MoveToFolder
          onSaveHandler={this.moveFolder}
          onCancelHandler={this.closeMoveToFolderModal}
        />
      </Dialog>
    );
  }

  renderStyle() {
    const value = 100;

    const styleAnchorEl = (<span className="inner">
      {`${AVAILABLE_STYLES[this.state.styleName]}`}
      <i className="fas fa-chevron-down"/>
    </span>);

    return (
      <div className="form-group global-style" onClick={this.openStyleMenu.bind(this)}>
        {styleAnchorEl}
        <Popover
          open={this.state.isStyleMenuOpened}
          anchorEl={this.state.styleMenuRef}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.closeStyleMenu.bind(this)}
        >
          <Menu onChange={this.handleStyleChange.bind(this)}>
            {Object.keys(AVAILABLE_STYLES).map((k) => <MenuItem key={k} value={k} primaryText={AVAILABLE_STYLES[k]}/>)}
          </Menu>
        </Popover>
      </div>
    );
  }

  handleAddChange(proxy, value) {
    const {workspaceId, board} = this.props;
    const boardId = board.get('id');

    if (value === 'n') {
      const options = {
        closeCb: () => false,
        content: (
          <NestModal boardId={`${boardId}`} initialValues={{name: ''}}/>
        ),
      };
      const buttons = [];

      this.props.dispatch(showDialog(options, buttons));
    } else if (value === 'wi') {
      const options = {
        closeCb: () => false,
        content: (
          <WorkItemCreateModal initialValues={{name: ''}} boardId={`${boardId}`}/>
        ),
      };
      const buttons = [];
      this.props.dispatch(showDialog(options, buttons));
    }

    this.setState({isAddMenuOpened: false, addMenuRef: null});
  }

  closeModal = () => {
    const {
      params: {
        boardId,
        workspaceId,
      },
    } = this.props;

    browserHistory.push(`/${workspaceId}/boards/${boardId}`);
  }

  createField(fieldType) {
    const {
      board,
      workspaceId,
      dispatch,
    } = this.props;
    let fieldName = fieldType.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    if (fieldType === 'selector') {
      fieldName = 'Status';
    }

    const field = {
      originalType: fieldType,
      type: fieldType,
      name: fieldName,
    };

    dispatch(createField(workspaceId, board.get('id'), field));

    this.closeAddMenu();
  }

  renderAdd() {
    const {board} = this.props;


    if (board.get('role') === ROLE.READ) {
      return;
    }

    return (
      <div className="board-add">
        <IconButton>
          <AddIcon onClick={this.openAddMenu.bind(this)}/>
        </IconButton>
        <Popover
          open={this.state.isAddMenuOpened}
          anchorEl={this.state.addMenuRef}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.closeAddMenu.bind(this)}
        >
          <Menu onChange={this.handleAddChange.bind(this)}>
            <MenuItem key="n" value="n" primaryText="Nest"/>
            <MenuItem key="wi" value="wi" primaryText="Work item"/>
            <MenuItem
              primaryText="Field"
              rightIcon={<ArrowDropRight />}
              menuItems={[
                <MenuItem
                  value="date"
                  key="field_date"
                  primaryText="Date"
                  disabled={false}
                  leftIcon={<i className="far fa-calendar-alt" style={{top: '4px'}} />}
                  onClick={() => this.createField('date')}
                />,
                <MenuItem
                  value="number"
                  key="field_number"
                  primaryText="Number"
                  disabled={false}
                  leftIcon={<i className="fas fa-sort-numeric-up" style={{top: '4px'}} />}
                  onClick={() => this.createField('number')}
                />,
                <MenuItem
                  value="short-text"
                  key="field_short-text"
                  primaryText="Short Text"
                  leftIcon={<i className="fas fa-font" style={{top: '3px'}} />}
                  onClick={() => this.createField('short-text')}
                />,
                <MenuItem
                  value="person"
                  key="field_person"
                  primaryText="Person"
                  disabled={false}
                  leftIcon={<i className="fas fa-user" style={{top: '3px'}} />}
                  onClick={() => this.createField('person')}
                />,
                <MenuItem
                  value="timeline"
                  key="field_timeline"
                  primaryText="Timeline"
                  disabled={false}
                  leftIcon={<i className="fas fa-map-signs" style={{top: '4px'}} />}
                  onClick={() => this.createField('timeline')}
                />,
                <MenuItem
                  value="selector"
                  key="field_selector"
                  primaryText="Status"
                  disabled={false}
                  leftIcon={<i className="far fa-check-circle" style={{top: '4px'}} />}
                  onClick={() => this.createField('selector')}
                />,
                <MenuItem
                  value="external-link"
                  key="field_external-link"
                  primaryText="External Link"
                  disabled={false}
                  leftIcon={<i className="fas fa-external-link-alt" style={{top: '3px'}} />}
                  onClick={() => this.createField('external-link')}
                />,
                <MenuItem
                  value="percentage"
                  key="field_percentage"
                  primaryText="Percentage"
                  disabled={false}
                  leftIcon={<i className="fas fa-percent" style={{top: '4px'}} />}
                  onClick={() => this.createField('percentage')}
                />,
                <MenuItem
                  value="dependency"
                  key="field_dependency"
                  primaryText="Dependency"
                  disabled={false}
                  leftIcon={<i className="fas fa-sitemap" style={{top: '4px'}} />}
                  onClick={() => this.createField('dependency')}
                />,
              ]}
            />
          </Menu>
        </Popover>
      </div>
    );
  }

  renderFilters() {
    const {board} = this.props;

    if (board.get('role') === ROLE.READ) {
      return;
    }

    return (
      <div className="board-filter">
        <BoardFilter />
      </div>
    );
  }

  loadMore() {
    const {workspaceId, board} = this.props;
    const boardId = board.get('id');

    BoardsService.getChanges(workspaceId, boardId, this.loadPageNumber).then((data) => {

      if (data.length === 0) {
        this.setState({allLoaded: true});
      } else {
        this.setState({changeList: this.state.changeList.concat(data)});
        this.loadPageNumber += 1;
      }
    });
  }

  renderNotification() {
    const notificationClassNames = classnames(
      'board-notifications',
      {
        'read': this.state.changeCount === 0,
      }
    );

    let moreButton = (
      <button className="load-more-button button button--primary" onClick={this.loadMore.bind(this)}>Load 20 more
        ... </button>);
    if (this.state.allLoaded) {
      moreButton = (<h3 className="all-loaded">Showing all changes</h3>);
    }

    return (
      <div className={notificationClassNames}>
        <IconButton>
          <NotificationsIcon onClick={this.openNotificationMenu.bind(this)}/>
        </IconButton>
        <Popover
          open={this.state.isNotificationMenuOpened}
          anchorEl={this.state.notificationMenuRef}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.closeNotificationMenu.bind(this)}
        >
          <div style={{width: '350px', padding: '10px'}}>
            <h3>Recent changes</h3>

            {this.state.changeList.map(c => this.renderChangeItem(c))}

            {moreButton}
          </div>
        </Popover>
      </div>
    );
  }

  openNotificationMenu(event) {
    this.setState({
      isNotificationMenuOpened: true,
      notificationMenuRef: event.currentTarget.parentElement,
      changeCount: 0,
    });

    this.loadMore();
  }

  openAddMenu(event) {
    this.setState({
      isAddMenuOpened: true,
      addMenuRef: event.currentTarget.parentElement,
    });

    const {workspaceId, board} = this.props;
    const boardId = board.get('id');

    BoardsService.getChanges(workspaceId, boardId).then((data) => {
      this.setState({changeList: data});
    });
  }

  closeAddMenu() {
    this.setState({isAddMenuOpened: false, addMenuRef: null});
  }

  closeNotificationMenu() {
    this.setState({isNotificationMenuOpened: false, notificationMenuRef: null});
    this.loadPageNumber = 0;
  }

  goalProgress(goalData) {
    const goalInfo = goalData.get('goalData') || Map();

    const goalStatusesObj = goalInfo.get('goalStatuses');

    const goalStatuses = goalStatusesObj ? goalStatusesObj.toJS() || {} : {};
    const totalItemSum = goalInfo.get('total') * 100 || 0;
    let actualItemSum = 0;

    for (const propertyKey in goalStatuses) {
      if (goalStatuses.hasOwnProperty(propertyKey)) {
        const propValue = goalStatuses[propertyKey] || 0;
        actualItemSum += propValue || 0;
      }
    }

    const progress = totalItemSum === 0 ? 0 : (actualItemSum / totalItemSum) * 100 || 0;

    return progress;
  }

  renderGoalProgress(goalData) {
    const progress = this.goalProgress(goalData);
    let progressState = {};

    if (progress <= 20) {
      progressState = PROGRESS_STATE.fail;
    } else if (progress > 20 && progress <= 40) {
      progressState = PROGRESS_STATE.amber;
    } else if (progress > 40 && progress <= 75) {
      progressState = PROGRESS_STATE.almost;
    } else {
      progressState = PROGRESS_STATE.success;
    }

    if (progress === 100) {
      return (
        <i className="fas fa-check-circle" />
      );
    }

    return this.renderProgressValue(parseInt(progress, 10), progressState.graph);
  }

  renderProgressValue = (progress, color) => {
    const inputStyle = {
      width: '64px',
      verticalAlign: 'middle',
      border: '0px',
      background: 'none',
      font: 'bold 18px Arial',
      textAlign: 'center',
      color,
      padding: '0px',
      WebkitAppearance: 'none',
    };

    return (
      <input
        style={inputStyle}
        type="text"
        value={`${progress}%`}
        disabled="disabled"
        readOnly={true}
      />
    );
  }

  handleFocusOnDateField = (focusedObj) => {
    const {focused} = focusedObj;

    this.setState({
      focusedDatePicker: focused,
    });
  }

  handleChangeDatePicker = (date) => {
    const {
      dispatch,
      board,
      workspaceId,
    } = this.props;
    const dueDate = date.toISOString();
    const boardId = board.get('id');

    const goal = {
      dueDate,
    };

    BoardsService.updateBoard(workspaceId, boardId, goal, true)
      .then(response => dispatch(updateGoalDueDate(boardId, dueDate)))
      .catch(error => false);
  }

  renderGoalInfo() {
    const {board} = this.props;
    const goalEndDate = board.get('dueDate') ? moment(board.get('dueDate')) : moment();

    return (
      <div className="goal-info">
        <div className="progress-info">{this.renderGoalProgress(board)}</div>
        <div>by</div>
        <div className="goal-due-date">
          <SingleDatePicker
            date={goalEndDate}
            onDateChange={this.handleChangeDatePicker}
            focused={this.state.focusedDatePicker}
            onFocusChange={this.handleFocusOnDateField}
            numberOfMonths={2}
            placeholder="&nbsp;"
            hideKeyboardShortcutsPanel
            isOutsideRange={() => false}
          />
        </div>
      </div>
    );
  }

  renderDeleteModal() {
    if (!this.state.showDeleteModal) {
      return null;
    }

    return (
      <Dialog
        modal={false}
        open={true}
        onRequestClose={() => {
          this.setState({showDeleteModal: false});
        }}
        className="workitem-move-to"
      >
        <div>
          <h4 className="confirmation-message">Delete board</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following board
            <span className="text--italic"> {this.props.board.name}</span> ?
          </p>
          <div className="dialog-footer">
            <button type="button" className="button button--primary" onClick={this.remove}>Ok</button>
            <button
              type="button"
              className="button button--link"
              onClick={() => {
                this.setState({showDeleteModal: false});
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

  render() {
    const {
      board,
      isGoal,
    } = this.props;
    const classString = classnames('board-title-actions-section', {
      'sticky': this.state.fixedHeader,
    });

    let boardActions = null;
    if (board.get('role') === ROLE.ADMIN) {
      boardActions = (<div className="board-actions">
        <IconMenu
          iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
          anchorOrigin={{horizontal: 'left', vertical: 'top'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onItemClick={this.handleClickOnDropdownItem}
        >
          <MenuItem
            primaryText={isGoal ? 'Goal settings' : 'Board settings'}
            leftIcon={<i className="fas fa-cog" style={{top: '3px'}}/>}
            value="EDIT_BOARD"
          />

          {
            !isGoal ?
              <MenuItem
                primaryText="Move to folder"
                leftIcon={<i className="fas fa-exchange-alt" style={{top: '3px'}}/>}
                value="MOVE_FOLDER"
              /> :
              false
          }

          {
            !isGoal ?
              <MenuItem
                primaryText="Save as template"
                leftIcon={<i className="far fa-address-card" style={{top: '3px'}}/>}
                value="SAVE_BOARD_TEMPLATE"
              /> :
              false
          }

          <MenuItem
            primaryText={isGoal ? 'Clone goal' : 'Clone board'}
            leftIcon={<i className="far fa-copy" style={{top: '3px'}}/>}
            value="CLONE_BOARD"
          />

          <MenuItem
            primaryText={isGoal ? 'Copy goal link' : 'Copy board link'}
            leftIcon={<i className="fas fa-link" style={{top: '3px'}}/>}
            value="COPY_BOARD_LINK"
          />

          <Divider/>

          <MenuItem
            primaryText={isGoal ? 'Delete goal' : 'Delete board'}
            leftIcon={<i className="far fa-trash-alt" style={{top: '3px'}}/>}
            value="REMOVE_BOARD"
          />
        </IconMenu>

        {this.renderMoveToFolderModal()}
        {this.renderDeleteModal()}
      </div>);
    }

    return (
      <div className={classString}>
        <div className="container">
          <div className="flex-center-space-between">
            <div className="board-title flex-1">
              <RIEInput
                change={this.onChangeHandlerForTitle}
                value={board.get('name')}
                format={() => false}
                propName="fieldValue"
                className="board-title-placeholder"
                classEditing="board-title-edit"
              />
            </div>

            {isGoal ? this.renderGoalInfo() : false}

            <div className="flex-1" style={{display: 'flex'}}>
              {this.renderAdd.bind(this)()}
              {!isGoal ? this.renderFilters() : false}
            </div>
            <div className="flex-center-space-between flex-1 right-side">
              <div>
                <a target="_blank" href="https://www.workcycle.io/kanban">Kanban</a>
              </div>
              <div>
                <a target="_blank" href="https://www.workcycle.io/canvas">Canvas</a>
              </div>
              <div>
                <a target="_blank" href="https://www.workcycle.io/custom-forms">Forms</a>
              </div>
              {this.renderNotification.bind(this)()}
              <div className="board-style">{this.renderStyle.bind(this)()}</div>
              {boardActions}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

BoardInfoTitle.defaultProps = {
  isGoal: false,
};

BoardInfoTitle.propTypes = {
  board: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  workspaceId: PropTypes.number.isRequired,
  params: PropTypes.object,
  isGoal: PropTypes.bool,
};

export default BoardInfoTitle;
