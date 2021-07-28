import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import Button from './../../../components/button/button.component';
import SelectField from './../../../components/form/selectField/selectField.component';
import InputField from './../../../components/form/inputField/inputField.component';
import boardService from './../../boards/board/board.service';
import globalSearchService from './../../globalSearch/globalSearch.service';

import {addChildOfItem} from './../workItems.actions';

import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import {dismissDialog} from './../../dialog/dialog.actions';

class WorkItemAddAsChildTo extends Component {

  state = {
    selectedWorkItem: null,
    selectedWorkItemId: null,
    isBoardDataLoading: false,
    currentSelectedBoard: '',
    boardId: null,
    query: '',
    workItems: [],
  };

  componentWillMount() {
    this.newBoardSelected(parseInt(this.props.boardId, 10));
  }

  newBoardSelected = (boardId) => {

    this.setState({
      currentSelectedBoard: boardId,
      query: '',
      isBoardDataLoading: true,
    });
    
    // get the data based on the new board id
    boardService.getNestsAndWorkItems(boardId)
      .then(response => {
        this.setState({
          isBoardDataLoading: false,
          workItems: this.generateWorkItemsForSpecificBoard(response.nests, boardId),
        });
      })
      .catch(err => {
        this.setState({
          isBoardDataLoading: false,
          workItems: [],
        });
        // TODO: display some error
      });
  }

  handleOnChange = (evt) => {
    this.setState({
      query: evt.target.value,
      currentSelectedBoard: '',
    });

    // TODO: remove the hardcoded values, since this is global, the API still need the workspace id and board id
    if (evt.target.value !== '') {
      globalSearchService.search('1', '63', {item: evt.target.value})
        .then(response => {
          this.setState({
            workItems: this.generateWorkItemsForSpecificQuery(response),
          });
        })
        .catch(err => {
          this.setState({
            workItems: [],
          });
        });
    } else {
      this.setState({
        workItems: [],
      });
    }
  }

  generateWorkItemsForSpecificQuery = (response) => {
    const workItems = [];

    response.map(item => {
      workItems.push({
        id: item.id,
        idBoard: item.idBoard,
        idNest: item.idNest,
        title: item.title,
      });
    });

    return workItems;
  }

  generateWorkItemsForSpecificBoard(nests = [], boardId = null) {
    const workItems = [];

    nests.map(nest => {
      if (nest.workItems.length > 0) {
        nest.workItems.map(workItem => {
          workItems.push({
            id: workItem.id,
            idBoard: boardId ? boardId : workItem.idBoard,
            idNest: workItem.idNest,
            title: workItem.title,
          });
        });
      }
    });

    return workItems;
  }

  handleSaveAddAsChildOf = () => {
    this.props.dispatch(addChildOfItem(
      this.props.boardId,
      this.props.workItemId,
      {
        idBoard: this.state.selectedWorkItem.idBoard,
        idNest: this.state.selectedWorkItem.idNest,
        idParent: this.state.selectedWorkItem.id,
      },
      {
        idNest: this.props.workItem.get('idNest'),
        idParent: this.props.workItem.get('idParent'),
      },
    ));
    this.props.dispatch(dismissDialog());
  }

  selectWorkItem = (event, value) => {
    const {workItems} = this.state;

    let item = {};

    workItems.map(workItem => {
      if (workItem.id === value) {
        item = workItem;
      }
    });

    this.setState({
      selectedWorkItemId: value,
      selectedWorkItem: item,
    });
  }

  renderTitle() {
    return (
      <h2 className="dependency-modal-title">Add as child of</h2>
    );
  }

  renderFilterAndSearch() {
    const options = [];
    const {boards} = this.props;
    boards.map(board => {
      options.push({
        label: board.get('name'),
        value: board.get('id'),
      });
    });

    return (
      <div className="dependency-modal-filter-search flex flex-center-space-between">
        <div className="flex-1">
          <SelectField
            clearable={false}
            options={options}
            label=""
            placeholder="Select board"
            onChangeHandler={this.newBoardSelected}
            selectedValue={this.state.currentSelectedBoard}
            searchable={true}
            isLoading={this.state.isBoardDataLoading}
          />
        </div>
        <div className="divider">or</div>
        <div className="flex-1 form-group">
          <input
            type="text"
            className="form-control"
            value={this.state.query}
            onChange={this.handleOnChange}
            placeholder="Search for parent"
            autoFocus
          />
        </div>
      </div>
    );
  }

  renderSelectedItem() {
    const {selectedWorkItem} = this.state;

    return (
      <div className="dependency-modal-count-section">
        <div className="count-section-label">Selected parent item:</div>
        <div className="count-section-number">
          {
            selectedWorkItem ?
              selectedWorkItem.title :
              'No item selected'
          }
        </div>
      </div>
    );
  }
  
  renderItems() {
    const {workItems} = this.state;
    const styles = {
      marginBottom: 6,
    };

    const markup = workItems.map((workItem, index) => {
      const key = `WORKITEM-${workItem.id}-${index}`;

      return (
        <RadioButton
          key={key}
          value={workItem.id}
          label={workItem.title}
          style={styles}
        />
      );
    });

    return markup;
  }

  renderWorkItems() {
    if (this.state.workItems.length === 0) {
      return (
        <div className="add-as-child-modal--workitems">
          There are no items for the current selection / query
        </div>
      );
    }

    return (
      <div className="add-as-child-modal--workitems">
        <RadioButtonGroup
          name="workItemId"
          onChange={this.selectWorkItem}
          defaultSelected={this.state.selectedWorkItemId}
        >
          {this.renderItems()}
        </RadioButtonGroup>
      </div>
    );
  }

  renderButtons() {
    return (
      <div className="dependency-modal-actions row">
        <div className="col-xs-6 col-sm-6 text-right">
          <Button
            label="Save"
            type="primary"
            onClick={this.handleSaveAddAsChildOf}
          />
        </div>
        <div className="col-xs-6 col-sm-6 text-left">
          <Button
            label="Cancel"
            onClick={() => this.props.dispatch(dismissDialog())}
            type="link"
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="dependency-modal add-as-child-modal">
        {this.renderTitle()}
        {this.renderFilterAndSearch()}
        {this.renderSelectedItem()}
        <div className="dependency-modal-count-section">
          <div className="count-section-label">List of items</div>
        </div>
        {this.renderWorkItems()}
        {this.renderButtons()}
      </div>
    );
  }
}

WorkItemAddAsChildTo.defaultProps = {};

WorkItemAddAsChildTo.propTypes = {
  boardId: PropTypes.string.isRequired,
  boards: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  workItem: PropTypes.object.isRequired,
  workItemId: PropTypes.number.isRequired,
};

export default connect((state, props) => {
  const boards = state.boards.get('data');

  return {
    boards,
  };
})(WorkItemAddAsChildTo);
