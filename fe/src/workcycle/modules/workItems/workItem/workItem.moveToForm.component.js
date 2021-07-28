import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Map} from 'immutable';

// // services
import boardService from './../../boards/board/board.service';
import workItemService from './workItem.service';

// // actions
import {dismissDialog} from './../../dialog/dialog.actions';
import {addDangerAlert} from './../../alerts/alert.actions';
import {
  updateWorkItem,
  removeChildWorkItem,
} from '../workItems.actions';
import {
  addWorkItemToNest,
  removeWorkItemFromNest,
} from './../../nests/nests.actions';

// components
import Button from './../../../components/button/button.component';
import SelectField from './../../../components/form/selectField/selectField.component';

class WorkItemMoveToForm extends Component {

  state = {
    selectedBoard: parseInt(this.props.boardId, 10),
    selectedNest: parseInt(this.props.nestId, 10),
    nests: [],
    isNestsLoading: false,
  };

  handleSubmitMoveWorkItem = () => {
    const {
      boardId,
      dispatch,
      nestId,
      workItem,
    } = this.props;
    const {
      selectedBoard,
      selectedNest,
    } = this.state;
    const newWorkItem = {
      ...workItem.toJS(),
      idNest: selectedNest,
      idBoard: selectedBoard,
      idParent: null,
    };
    const workItemParentId = workItem.get('idParent');

    workItemService.updateWorkItem(boardId, workItem.get('id'), newWorkItem)
      .then(response => {
        dispatch(updateWorkItem(workItem.get('id'), newWorkItem));

        if (parseInt(boardId, 10) !== selectedBoard) {
          // move item to another board
          dispatch(removeWorkItemFromNest(nestId, workItem.get('id')));
        } else if (parseInt(workItem.get('idNest'), 10) !== parseInt(selectedNest, 10)) {
          // move item to another nest from the same board
          dispatch(removeWorkItemFromNest(nestId, workItem.get('id')));
          dispatch(addWorkItemToNest(selectedNest, workItem.get('id')));
        }

        // item is child
        if (workItemParentId) {
          // remove from parent item children list
          dispatch(removeChildWorkItem(workItemParentId, workItem.get('id')));
        }
      })
      .catch(error => {
        dispatch(addDangerAlert('The workitem could not be moved.'));
      });

    this.props.dispatch(dismissDialog());
  };

  getBoardIdOptions() {
    const {boards} = this.props;
    const arr = [];

    boards.map(board => {
      arr.push({
        label: board.get('name'),
        value: board.get('id'),
      });
    });

    return arr;
  }

  getNestIdOptions() {
    const arr = [];
    const {
      nests,
      boardId,
    } = this.props;

    if (this.state.selectedBoard === parseInt(boardId, 10)) {
      nests.map(nest => {
        arr.push({
          label: nest.get('name'),
          value: parseInt(nest.get('id'), 10),
        });
      });
    } else {
      this.state.nests.map(nest => {
        arr.push({
          label: nest.name,
          value: parseInt(nest.id, 10),
        });
      });
    }

    return arr;
  }

  setBoard = (boardId) => {
    let isLoading = false;

    if (this.props.boardId !== boardId) {
      isLoading = true;
    }

    this.setState({
      selectedBoard: boardId,
      isNestsLoading: isLoading,
    });

    boardService.getNestsAndWorkItems(boardId)
      .then(response => {
        this.setState({
          nests: response.nests,
          selectedNest: parseInt(response.nests[0].id, 10) || '',
          isNestsLoading: false,
        });
      })
      .catch(err => {
        this.setState({
          isNestsLoading: false,
        });
      });
  };

  setNest = (nestId) => {
    this.setState({
      selectedNest: parseInt(nestId, 10),
    });
  };

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">Move workitem to another board or nest</h3>
      </div>
    );
  }

  renderBoardSelector() {
    const boardsIdOptions = this.getBoardIdOptions();

    return (
      <SelectField
        clearable={false}
        options={boardsIdOptions}
        label="FORM.LABEL.BOARD"
        placeholder="Please select a board"
        onChangeHandler={this.setBoard}
        selectedValue={this.state.selectedBoard}
        searchable={true}
      />
    );
  }

  renderNestSelector() {
    const nestssIdOptions = this.getNestIdOptions();

    return (
      <SelectField
        clearable={false}
        options={nestssIdOptions}
        label="FORM.LABEL.NEST"
        placeholder="Please select an nest"
        onChangeHandler={this.setNest}
        selectedValue={this.state.selectedNest}
        searchable={true}
        isLoading={this.state.isNestsLoading}
      />
    );
  }

  renderFormButtons() {
    const enabled = this.state.selectedNest !== '' && this.state.selectedBoard !== '';

    return (
      <div className="board-form-actions row">
        <div className="col-xs-12 text-center">
          <Button
            label="Move"
            type="primary"
            disabled={!enabled}
            onClick={this.handleSubmitMoveWorkItem}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderBoardSelector()}
        {this.renderNestSelector()}
        {this.renderFormButtons()}
      </div>
    );
  }
}

WorkItemMoveToForm.defaultProps = {};

WorkItemMoveToForm.propTypes = {
  boardId: PropTypes.string.isRequired,
  boards: PropTypes.object.isRequired,
  nests: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  nestId: PropTypes.number.isRequired,
  workItem: PropTypes.object.isRequired,
};

const moveWorkItem = connect((state, props) => {
  const boardsStore = state.boards;
  const nestsStore = state.nests;

  const nests = nestsStore.get('data') || Map();
  const boards = boardsStore.get('data') || Map();

  return {
    boards,
    nests,
  };
})(WorkItemMoveToForm);

export default moveWorkItem;
