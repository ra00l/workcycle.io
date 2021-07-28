import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import WorkItemModal from './../../modules/workItems/workItem/modal/workItemModal.component';

class DependencyWorkitemsList extends Component {

  state = {
    showWorkItemModal: false,
    workItemId: null,
    boardId: null,
    workspaceId: null,
  }

  selectedItem(workItemId, isInputChecked) {
    this.props.onItemChange(workItemId, isInputChecked);
  }

  handleClickOnWorkitem = (item) => {
    const {
      boardId,
      id,
      idBoard,
    } = item;
    const {workspaceId} = this.props;
    const board = boardId || idBoard;

    this.setState({
      showWorkItemModal: true,
      workItemId: id,
      boardId: board,
      workspaceId: workspaceId,
    });
  }

  renderWorkItems() {
    const {items} = this.props;

    const itemsMarkup = items.map((workItem, index) => {
      const {
        id,
        title,
      } = workItem;
      const key = `${index}_${id}`;
      const checked = this.props.listOfSelectedItems.includes(id);

      return (
        <div key={key} className="workitem">
          <div onClick={() => this.handleClickOnWorkitem(workItem)}>{title}</div>
          <div>
            <Checkbox
              checked={checked}
              onCheck={(evt, isInputChecked) => this.selectedItem(id, isInputChecked)}
            />
          </div>
        </div>
      );
    });
    
    return itemsMarkup;
  }

  closeModal = () => {
    this.setState({
      showWorkItemModal: false,
    });
  }

  renderNoItems() {
    return (
      <div>No items</div>
    );
  }

  renderWorkItemModal() {
    const {
      showWorkItemModal,
      workItemId,
      boardId,
      workspaceId,
    } = this.state;

    return (
      <Dialog
        modal={false}
        open={this.state.showWorkItemModal}
        onRequestClose={() => this.setState({
          showWorkItemModal: false,
          workItemId: null,
          boardId: null,
          workspaceId: null,
        })}
        className="workItem-material-modal"
        contentStyle={{transform: 'translate(0px, 0px)'}}
        autoScrollBodyContent={true}
      >
        <WorkItemModal
          boardId={`${boardId}`}
          workItemId={`${workItemId}`}
          workspaceId={`${workspaceId}`}
          closeModal={this.closeModal}
        />
      </Dialog>
    );
      
  }

  render() {
    const {items} = this.props;

    return (
      <div className="workitems-list">
        {items.length > 0 ? this.renderWorkItems() : this.renderNoItems()}

        {this.renderWorkItemModal()}
      </div>
    );
  }
}

DependencyWorkitemsList.defaultProps = {};

DependencyWorkitemsList.propTypes = {
  dispatch: PropTypes.func,
  items: PropTypes.array.isRequired,
  onItemChange: PropTypes.func.isRequired,
  listOfSelectedItems: PropTypes.array.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

export default DependencyWorkitemsList;
