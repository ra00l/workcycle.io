import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './../button/button.component';
import DependencyWorkitemsList from './dependency.workItemsList.component';
import SelectField from './../form/selectField/selectField.component';

import globalSearchService from './../../modules/globalSearch/globalSearch.service';
import boardService from './../../modules/boards/board/board.service';
import boardsService from './../../modules/boards/boards.service';

import {updateWorkItemCustomFieldDependencies} from './../../modules/workItems/workItems.actions';
import WorkItemCreateModal from '../../modules/workItems/workItem/workItemCreateModal.component';
import Dialog from 'material-ui/Dialog';

class DependencyField extends Component {

  state = {
    editMode: false,
    selectedWorkItems: [],
    selectedWorkItemsId: [],
    isBoardDataLoading: false,
    currentSelectedBoard: '',
    boardId: null,
    query: '',
    workItems: [],
    openAddDialog: false,
    boards: [],
    loadingBoard: false,
  };

  componentWillMount() {
    const {listOfDependenciesForCurrentItem} = this.props;
    const selectedWorkItemsId = [];

    listOfDependenciesForCurrentItem.forEach(item => {
      selectedWorkItemsId.push(item.id);
    });

    this.newBoardSelected(parseInt(this.props.boardId, 10));
    this.setState({
      selectedWorkItems: listOfDependenciesForCurrentItem,
      selectedWorkItemsId,
    });

    this.getBoardsAndGoals();
  }

  getBoardsAndGoals() {
    const {
      isGoal,
      workspaceId,
    } = this.props;

    this.setState({
      loadingBoard: true,
    });

    // fetch boards
    boardsService.getBoards(workspaceId)
      .then(response => {
        this.setState({
          boards: [...response.boardList],
          loadingBoard: false,
        });
      })
      .catch(() => {
        this.setState({
          loadingBoard: false,
        });
      });
  }

  closeHandler = () => {
    this.props.closeModal();
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
      globalSearchService.search('1', '63', evt.target.value)
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

  handleSaveDependenciesClicked = () => {
    this.setState({editMode: false});
  }

  onNewDependencyItemSelected = (workItemId, isInputChecked) => {
    if (isInputChecked) {
      let item = null;

      // search inside the current items of the board
      this.props.listOfDependenciesForCurrentItem.forEach(workItem => {
        if (workItem.id === workItemId) {
          item = workItem;
        }
      });

      // search inside the new requested board
      if (!item) {
        // the board is not the same as the current item
        this.state.workItems.forEach(workItem => {
          if (workItem.id === workItemId) {
            item = workItem;
          }
        });
      }

      const workItems = [...this.state.selectedWorkItems];
      workItems.push(item);

      this.setState({
        selectedWorkItems: workItems,
        selectedWorkItemsId: [...this.state.selectedWorkItemsId, workItemId],
      });

      this.updateDependencyList([...this.state.selectedWorkItemsId, workItemId], workItems);
    } else {
      // remove from dependencies
      const selectedWorkItemsId = this.state.selectedWorkItemsId;
      const selectedWorkItems = [...this.state.selectedWorkItems];

      const index = selectedWorkItemsId.indexOf(workItemId);
      if (index !== -1) {
        selectedWorkItemsId.splice(index, 1);
      }

      let indexToDelete = -1;

      selectedWorkItems.forEach((item, index) => {
        if (item.id === workItemId) {
          indexToDelete = index;
        }
      });

      if (indexToDelete !== -1) {
        selectedWorkItems.splice(indexToDelete, 1);
      }

      this.setState({
        selectedWorkItems,
        selectedWorkItemsId,
      });

      this.updateDependencyList(selectedWorkItemsId, selectedWorkItems);
    }
  }

  updateDependencyList(selectedIds, selectedWorkItems) {
    const {
      boardId,
      dispatch,
      field,
      workItem,
    } = this.props;
    const newWorkItem = {
      [field.get('id')]: selectedIds,
    };

    const workItemToSaveInTheStore = {
      [field.get('id')]: selectedWorkItems,
    };

    dispatch(
      updateWorkItemCustomFieldDependencies(
        boardId,
        workItem.get('id'),
        newWorkItem,
        field.get('id'),
        selectedWorkItems,
      )
    );
  }

  renderTitle() {
    let title = 'Dependency list';

    if (this.state.editMode) {
      title = 'Add/Edit dependencies';
    }

    return (
      <div className="flex-center-space-between">
        <h2 className="dependency-modal-title">{title}</h2>
        <i onClick={this.closeHandler} className="fa fa-times"/>
      </div>
    );
  }

  renderFilterAndSearch() {
    const options = [];
    const {boards} = this.state;

    boards.map(board => {
      options.push({
        label: board.name,
        value: board.id,
      });
    });

    if (!this.state.editMode) {
      return false;
    }

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
            placeholder="search for .."
          />
        </div>
      </div>
    );
  }

  renderDependencyCountSection() {
    const {
      dependencies,
      selectedWorkItemsId,
    } = this.state;
    const numberOfItems = selectedWorkItemsId.length;

    if (!this.state.editMode) {
      return (
        <div className="dependency-modal-count-section flex flex-center-space-between">
          <div className="count-section-label">Current dependencies:</div>
          <div className="count-section-number">{numberOfItems} items</div>
        </div>
      );
    }

    return false;
  }

  renderDependencies() {
    if (this.state.editMode) {
      return this.renderListOfNewDependencies();
    }

    return this.renderListOfCurrentDependencies();
  }

  addWorkItem() {
    // dispatch();
    // console.log('should open add item modal');

    // const options = {
    //   closeCb: () => false,
    //   content: (
    //     <WorkItemCreateModal initialValues={{name: ''}} boardId={`${this.state.currentSelectedBoard}`}/>
    //   ),
    // };
    // const buttons = [];
    // this.props.dispatch(showDialog(options, buttons));

    this.setState({openAddDialog: true});
  }

  renderListOfNewDependencies() {
    const items = this.state.workItems;

    return (
      <div>
        <div className="flex ">
          <h3 className="flex-1">Select work item(s)</h3>
          <div className="flex-05 text-right">
            <button className="button button--secondary" onClick={this.addWorkItem.bind(this)}>Add work item</button>
          </div>
        </div>
        <DependencyWorkitemsList
          onItemChange={this.onNewDependencyItemSelected}
          items={items}
          dispatch={this.props.dispatch}
          listOfSelectedItems={this.state.selectedWorkItemsId}
          workspaceId={this.props.workspaceId}
        />
      </div>);
  }

  renderListOfCurrentDependencies() {
    const items = this.state.selectedWorkItems;

    return (
      <DependencyWorkitemsList
        onItemChange={this.onNewDependencyItemSelected}
        items={items}
        dispatch={this.props.dispatch}
        listOfSelectedItems={this.state.selectedWorkItemsId}
        workspaceId={this.props.workspaceId}
      />
    );
  }

  renderButtons() {
    if (this.state.editMode) {
      return (
        <div className="dependency-modal-actions row">
          <div className="col-xs-12 col-sm-12 text-center">
            <Button
              label="Save"
              type="primary"
              onClick={this.handleSaveDependenciesClicked}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="dependency-modal-actions row">
        <div className="col-xs-12 col-sm-12 text-center">
          <Button
            label="Add new dependency"
            onClick={() => this.setState({editMode: true})}
            type="primary"
          />
        </div>
      </div>
    );
  }

  workItemCreateDone(idWorkItem) {
    if (idWorkItem) {
      // 1. refresh list + add to selection
      boardService.getNestsAndWorkItems(this.state.currentSelectedBoard)
        .then(response => {
          this.setState({
            isBoardDataLoading: false,
            workItems: this.generateWorkItemsForSpecificBoard(response.nests, this.state.currentSelectedBoard),
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

    this.setState({openAddDialog: false});
  }

  render() {
    let addDialog = null;

    if (this.state.loadingBoard) {
      return false;
    }

    if (this.state.openAddDialog) {
      addDialog = (<Dialog
        modal={true}
        open={true}
        onRequestClose={() => this.setState({
          openAddDialog: false,
        })}
        className="workItem-material-modal"
        contentStyle={{transform: 'translate(0px, 0px)'}}
        autoScrollBodyContent={true}
      >
        <WorkItemCreateModal
          initialValues={{name: ''}}
          boardId={`${this.state.currentSelectedBoard}`}
          onClose={this.workItemCreateDone.bind(this)}
        />
      </Dialog>);
    }

    return (
      <div className="dependency-modal">
        {addDialog}
        {this.renderTitle()}
        {this.renderFilterAndSearch()}
        {this.renderDependencyCountSection()}
        {this.renderDependencies()}
        {this.renderButtons()}
      </div>
    );
  }
}

DependencyField.defaultProps = {
  isGoal: false,
};

DependencyField.propTypes = {
  boardId: PropTypes.string.isRequired,
  // boards: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  field: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
  listOfDependenciesForCurrentItem: PropTypes.array.isRequired,
  workspaceId: PropTypes.number.isRequired,
  isGoal: PropTypes.bool,
};

export default connect((state, props) => {
  const companyStore = state.company;
  // const boards = state.boards.get('data');
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;

  return {
    // boards,
    workspaceId,
  };
})(DependencyField);
