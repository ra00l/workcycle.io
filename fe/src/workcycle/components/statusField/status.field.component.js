import React, {Component} from 'react';
import PropTypes from 'prop-types';
import StatusFieldEdit from './status.field.edit.component.js';

const statusColours = [
  '#F6C667', '#B30753', '#6A65D8', '#48BA95', '#2D6E7E', '#48C0D3', '#403321', '#CA82F8',
  '#005792', '#0074E4', '#F96D00', '#F75940', '#259F6C', '#3E4377', '#FD367E', '#FFDE25',
  '#FF563A', '#2EC643', '#90B9FF', '#4DB9FF', '#FAB610', '#CACCCD', '#000000',
];

class StatusField extends Component {

  state = {
    editMode: false,
    currentField: this.props.field.toJS(),
  };

  handleClickOnActions = () => {
    this.setState({
      editMode: true,
    });
  }

  handleUpdateList = (newList) => {
    this.setState({
      editMode: false,
    });

    this.setState({
      currentField: {
        ...this.state.currentField,
        meta: newList,
      },
    });

    this.props.handleUpdateFieldList(newList);
  }

  handleSelectValue = (id) => {
    this.props.selectedValueHandler(id);
  };

  getSelectedColours() {
    const {currentField} = this.state;
    let colours = [];

    if (currentField && currentField.meta) {
      colours = currentField.meta;
    }

    return colours;
  }

  getRemainigColours() {
    const {currentField} = this.state;
    const colours = [...statusColours];

    if (currentField && currentField.meta) {
      currentField.meta.forEach(status => {
        const index = colours.indexOf(status.color);
        if (index !== -1) {
          colours.splice(index, 1);
        }
      });
    }

    return colours;
  }

  renderEdit() {
    const colours = this.getSelectedColours();
    const remainingColours = this.getRemainigColours();

    return (
      <StatusFieldEdit
        colours={colours}
        remainingColours={remainingColours}
        handler={this.handleUpdateList}
      />
    );
  }

  renderPossibleValue() {
    const {currentField} = this.state;

    if (currentField && currentField.meta && currentField.meta.length) {
      const items = currentField.meta.map((item, index) => {
        const style = {
          background: item.color,
          borderColor: item.color,
        };

        return (
          <div
            key={index}
            style={style}
            className="status-field-possible-value"
            onClick={() => this.handleSelectValue(item.id)}
          >
            {item.label}
          </div>
        );
      });

      return (
        <div className="status-field-possible-values">
          {items}
        </div>
      );
    }

    return (
      <span>No statuses added</span>
    );
  }

  renderClearValue() {
    const {currentField} = this.state;

    if (currentField && currentField.meta && currentField.meta.length) {
      return (
        <div className="status-field-clear-value" onClick={() => this.handleSelectValue(-1)}>
          Clear
        </div>
      );
    }

    return false;
  }

  renderView() {
    return (
      <div>
        <div className="status-field-items">
          {this.renderPossibleValue()}
          {this.renderClearValue()}
        </div>
        <div className="status-field-actions" onClick={this.handleClickOnActions}>
          Add/Edit status
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="status-field">
        {
          this.state.editMode ?
            this.renderEdit() :
            this.renderView()
        }
      </div>
    );
  }
}

StatusField.defaultProps = {};

StatusField.propTypes = {
  field: PropTypes.object.isRequired,
  selectedValueHandler: PropTypes.func.isRequired,
  handleUpdateFieldList: PropTypes.func.isRequired,
};

export default StatusField;
