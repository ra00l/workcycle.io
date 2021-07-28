import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import {AreaChart, Area} from 'recharts';
import Knob from '../../components/knob/knob.component';
import {browserHistory, Link} from 'react-router';
import ROLE from '../../contants/role.constants';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import browserUtilService from '../../services/browser.util.service';
import {addSuccessAlert} from '../alerts/alert.actions';
import BoardsService from '../boards/boards.service';
import {cloneBoard, removeBoard} from '../boards/boards.actions';
import Dialog from 'material-ui/Dialog';
import BoardModal from '../boards/board/boardModal.component';
import {showConfirmationDialog, showDialog} from '../dialog/dialog.actions';
import {removeGoal} from './../goals/goals.actions';

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
    graph: '#51c40a',
    line: '#4cd96566',
  },
};

class Goal extends Component {

  state = {
    showDeleteModal: false,
  }

  goalProgress() {
    const {goalData} = this.props;
    const goalInfo = goalData.get('goalData') || Map();

    const goalStatusesObj = goalInfo.get('goalStatuses');

    const goalStatuses = goalStatusesObj ? goalStatusesObj.toJS() || {} : {};
    const totalItemSum = goalInfo.get('total') * 100 || 0;
    let actualItemSum = 0;

    for (const propertyKey in goalStatuses) {
      if (goalStatuses.hasOwnProperty(propertyKey)) {
        const propValue = goalStatuses[propertyKey] || 0;
        actualItemSum += propValue;
      }
    }

    const progress = (actualItemSum / totalItemSum) * 100 || 0;

    return progress;
  }

  getTargetProgressClassString() {
    const progress = this.goalProgress();

    return classnames({
      'fail': progress <= 20,
      'amber': progress > 20 && progress <= 40,
      'almost': progress > 40 && progress <= 75,
      'success': progress > 75,
    });
  }

  renderProgressValue = (progress, color) => {
    const inputStyle = {
      width: '64px',
      height: '40px',
      position: 'absolute',
      verticalAlign: 'middle',
      marginTop: '40px',
      marginLeft: '-92px',
      border: '0px',
      background: 'none',
      font: 'bold 24px Arial',
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

  renderTargetProgress() {
    const progress = this.goalProgress();
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

    return (
      <Knob
        value={progress}
        width={120}
        height={120}
        onChange={() => false}
        thickness={0.12}
        lineCap="round"
        readOnly={true}
        bgColor={progressState.line}
        fgColor={progressState.graph}
        displayInput={false}
        displayCustom={() => this.renderProgressValue(parseInt(progress, 10), progressState.graph)}
      />
    );
  }

  renderTimeLine() {
    const {goalData} = this.props;
    const goalEndDate = goalData.get('dueDate') ? moment(goalData.get('dueDate')) : moment();
    const endDate = goalEndDate.format('DD.MM.YYYY');
    const today = moment();
    const days = goalEndDate.diff(today, 'days');
    // let daysLabel = days === 1 ? 'day' : 'days';

    if (days === 0) {
      return (
        <span>By: <span className="goal-due-date">{endDate}</span></span>
      );
    }

    // if (days < 0) {
    //   days = days * -1;
    //   daysLabel = `${daysLabel} ago`;
    // }

    return (
      <span>
        <span>By: <span className="goal-due-date">{endDate}</span></span>
        {/* <br />
        <span>
          <i className="far fa-calendar-alt" /> {days} {daysLabel}
        </span> */}
      </span>
    );
  }

  renderGoalInformation() {
    const {goalData} = this.props;
    const goalInfo = goalData.get('goalData') || Map();
    const totalItems = goalInfo.get('total') || 0;
    const doneItems = goalInfo.get('done') || 0;
    const goalName = goalData.get('name');
    const openItems = totalItems - doneItems;

    const openItemsMarkup = (
      <span>
        Open: <span className="goal-items">{openItems}</span>
      </span>
    );

    const completedItemsMarkup = (
      <span>
        Completed: <span className="goal-items">{doneItems}</span>
      </span>
    );

    return (
      <div className="goal-information">
        <div className="goal-information-timeline">
          <div>
            <div>{openItems ? openItemsMarkup : completedItemsMarkup}</div>
            <div>{this.renderTimeLine()}</div>
          </div>
        </div>
        <div className="goal-information-name" title={goalName}>
          <div>{goalName}</div>
        </div>
        <div className="goal-information-target">
          {this.renderTargetProgress()}
        </div>
      </div>
    );
  }

  renderGoalGraph() {
    const {goalData} = this.props;
    const goalInfo = goalData.get('goalData') || Map();
    const progress = this.goalProgress();
    let progressState = {};
    const graphData = [];

    if (progress <= 20) {
      progressState = PROGRESS_STATE.fail;
    } else if (progress > 20 && progress <= 40) {
      progressState = PROGRESS_STATE.amber;
    } else if (progress > 40 && progress <= 75) {
      progressState = PROGRESS_STATE.almost;
    } else {
      progressState = PROGRESS_STATE.success;
    }

    if (goalInfo.get('effortArr')) {
      const effortValues = goalInfo.get('effortArr').toJS();
      const extractedData = {};
      
      for (const propertyKey in effortValues) {
        if (effortValues.hasOwnProperty(propertyKey)) {
          const propValue = moment(effortValues[propertyKey]);
          const key = propValue.format('DD-MM-YYYY');

          if (extractedData[key]) {
            extractedData[key] = extractedData[key] + 1;
          } else {
            extractedData[key] = 1;
          }
        }
      }

      let previosValue = 0;

      for (const propertyKey in extractedData) {
        if (extractedData.hasOwnProperty(propertyKey)) {
          graphData.push({
            date: propertyKey,
            numberOfItems: extractedData[propertyKey] + previosValue,
          });

          previosValue = extractedData[propertyKey] + previosValue;
        }
      }
    }

    // we need at least 2 values to create the array
    if (graphData && graphData.length <= 1) {
      const item = graphData[0];

      if (item) {
        const pointDate = moment(item.date);
        const prevDate = pointDate.subtract(1, 'days').format('DD-MM-YYYY');
  
        graphData.splice(0, 0, {date: prevDate, numberOfItems: 0});
      }
    }

    return (
      <div className="goal-chart-container">
        <AreaChart width={270} height={70} data={graphData} margin={{top: 5, right: 0, left: 0, bottom: 5}}>
          <Area type="monotone" dataKey="numberOfItems" stroke={progressState.graph} fill={progressState.line} />
        </AreaChart>
      </div>
    );
  }

  editBoard = () => {
    const {
      dispatch,
      goalId,
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <BoardModal
          boardId={goalId}
          isGoal={true}
          editMode={true}
        />
      ),
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  cloneBoard = () => {
    const goalName = this.props.goalData.get('name');

    const options = {
      closeCb: () => false,
      content: (
        <div>
          <h4 className="confirmation-message">
            Clone goal
          </h4>
          <p className="confirmation-message-detail">
            Are you sure you want to clone the following goal
            <span className="text--italic"> {goalName}</span> ?
          </p>
        </div>
      ),
    };
    const buttons = {
      clickCb: this.clone,
      label: 'Clone',
    };

    this.props.dispatch(showConfirmationDialog(options, buttons));
  }

  clone = () => {
    const {
      workspaceId,
      dispatch,
    } = this.props;

    dispatch(cloneBoard(workspaceId, this.props.goalId, true));
  }

  remove = () => {
    const {
      dispatch,
      workspaceId,
    } = this.props;

    const boardId = this.props.goalId;

    BoardsService.removeBoard(workspaceId, boardId)
      .then(response => {
        dispatch(removeBoard(boardId));

        // remove goal -> update goals store
        dispatch(removeGoal(boardId));
        this.setState({showDeleteModal: false});
      })
      .catch(err => {
        // TODO: alert something went wrong
      });
  }

  renderDeleteModal() {
    if (!this.state.showDeleteModal) {
      return null;
    }

    const goalName = this.props.goalData.get('name');

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
          <h4 className="confirmation-message">Delete goal</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following goal
            <span className="text--italic"> {goalName}</span> ?
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
      case 'EDIT_BOARD':
        this.editBoard();
        break;
    }
  };

  copyBoardLink() {
    const {
      goalId,
      dispatch,
      workspaceId,
    } = this.props;


    const message = 'Link to goal copied to clipboard!';
    browserUtilService.copyToClipboard(browserUtilService.getAbsoluteLink(`/${workspaceId}/goals/${goalId}`));

    dispatch(addSuccessAlert(message));
  }

  render() {
    const {
      goalId,
      workspaceId,
    } = this.props;
    const classString = classnames('goal', {
      [`goal-${this.getTargetProgressClassString()}`]: true,
    });

    const goalRole = this.props.goalData.get('role');

    let goalActions = (<IconMenu
      iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
      anchorOrigin={{horizontal: 'left', vertical: 'top'}}
      targetOrigin={{horizontal: 'right', vertical: 'top'}}
      onItemClick={this.handleClickOnDropdownItem}
    >
      <MenuItem
        primaryText="Goal settings"
        leftIcon={<i className="fas fa-cog" style={{top: '3px'}}/>}
        value="EDIT_BOARD"
      />

      <MenuItem
        primaryText="Clone goal"
        leftIcon={<i className="far fa-copy" style={{top: '3px'}}/>}
        value="CLONE_BOARD"
      />
      <MenuItem
        primaryText="Copy goal link"
        leftIcon={<i className="fas fa-link" style={{top: '3px'}}/>}
        value="COPY_BOARD_LINK"
      />
      <Divider/>
      <MenuItem
        primaryText="Delete goal"
        leftIcon={<i className="far fa-trash-alt" style={{top: '3px'}}/>}
        value="REMOVE_BOARD"
      />
    </IconMenu>);

    if (goalRole !== ROLE.ADMIN) {
      goalActions = null;
    }

    return (
      <div className={classString}>
        <Link to={`/${workspaceId}/goals/${goalId}`}>
          {this.renderGoalInformation()}
          {this.renderGoalGraph()}
        </Link>

        <div className="goal-actions">{goalActions}</div>

        {this.renderDeleteModal()}
      </div>
    );
  }
}

Goal.propTypes = {
  goalData: PropTypes.object,
  goalId: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

export default connect((state, props) => {
  const goalsStore = state.goals;
  const companyStore = state.company;

  return {
    goalData: goalsStore.getIn(['data', `${props.goalId}`]),
    workspaceId: companyStore.lastWorkspace,
  };
})(Goal);
