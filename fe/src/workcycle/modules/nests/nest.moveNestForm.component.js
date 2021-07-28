import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

// services
import l10nService from '../l10n/l10n.service';
import nestsService from './nests.service';

// actions
import {dismissDialog} from './../dialog/dialog.actions';
import {
  addDangerAlert,
  addSuccessAlert,
} from '../alerts/alert.actions';
import {moveNestToAnotherBoard} from './nests.actions';
import {addWorkItems} from './../workItems/workItems.actions';

// components
import InputField from '../../components/form/inputField/inputField.component';
import Button from '../../components/button/button.component';
import SelectField from './../../components/form/selectField/selectField.component';

class MoveNest extends Component {

  state = {
    selectedValue: '',
  }

  handleSubmitMoveNest = () => {
    const {
      boardId,
      dispatch,
      nestId,
      nest,
    } = this.props;
    const {selectedValue} = this.state;
    const newNest = {
      ...nest.toJS(),
      idBoard: selectedValue,
    };

    if (selectedValue && selectedValue !== '') {
      dispatch(moveNestToAnotherBoard(boardId, nestId, newNest));
    }

    this.props.dispatch(dismissDialog());
  }

  getBoardIdOptions() {
    const {boards} = this.props;
    const arr = [];

    if (boards.size > 0) {
      boards.map(board => {
        arr.push({
          label: board.get('name'),
          value: board.get('id'),
        });
      });
    }

    return arr;
  }

  setBoard = (boardId) => {
    this.setState({
      selectedValue: boardId,
    });
  }

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">Move nest to another board</h3>
      </div>
    );
  }

  renderForm() {
    const boardsIdOptions = this.getBoardIdOptions();

    return (
      <SelectField
        clearable={true}
        options={boardsIdOptions}
        label="FORM.LABEL.BOARD"
        placeholder="Please select a board"
        onChangeHandler={this.setBoard}
        selectedValue={this.state.selectedValue}
        searchable={true}
      />
    );
  }

  renderFormButtons() {
    return (
      <div className="board-form-actions row">
        <div className="col-xs-12 text-center">
          <Button
            label="Move"
            type="primary"
            onClick={this.handleSubmitMoveNest}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        <div className="margin-bottom-12">
          Please be aware that if you choose to move this nest to another board, the fields releated
          to the board will no longer apply in the choosen board for the workitems.
        </div>
        {this.renderForm()}
        {this.renderFormButtons()}
      </div>
    );
  }
}

MoveNest.defaultProps = {};

MoveNest.propTypes = {
  boardId: PropTypes.string,
  boards: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  nestId: PropTypes.number.isRequired,
  nest: PropTypes.object.isRequired,
};

const moveNest = connect((state, props) => ({
  boards: state.boards.get('data'),
}))(MoveNest);

export default moveNest;
