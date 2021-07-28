import React, {Component} from 'react';
import PropTypes from 'prop-types';

const statusColours = [
  '#F6C667', '#B30753', '#6A65D8', '#48BA95', '#2D6E7E', '#48C0D3', '#403321', '#CA82F8',
  '#005792', '#0074E4', '#F96D00', '#F75940', '#259F6C', '#3E4377', '#FD367E', '#FFDE25',
  '#FF563A', '#2EC643', '#90B9FF', '#4DB9FF', '#FAB610', '#CACCCD', '#000000',
];

class StatusFieldEdit extends Component {

  state = {
    hoverColor: '',
    colours: this.props.colours,
    remainingColours: this.props.remainingColours,
  };

  handleClickOnActions = () => {
    this.props.handler(this.state.colours);
  }

  onMouseEnterAvailableColour = (color) => {
    this.setState({
      hoverColor: color,
    });
  }

  onMouseLeaveAvailableColour = () => {
    this.setState({
      hoverColor: '',
    });
  }

  handleChange = (colorItem, evt) => {
    const {colours} = this.state;

    colours.forEach(item => {
      if (item.id === colorItem.id) {
        item.label = evt.target.value;
      }
    });

    this.setState({
      colours,
    });
  }

  addColour = (color) => {
    const colours = this.state.colours;
    const remainingColours = this.state.remainingColours;
    const index = remainingColours.indexOf(color);
    const id = statusColours.indexOf(color);

    if (index !== -1) {
      remainingColours.splice(index, 1);
    }

    colours.push({
      id,
      color,
      label: '',
    });

    this.setState({
      hoverColor: '',
      colours,
      remainingColours,
    });
  }

  deleteColour = (color) => {
    const colours = this.state.colours;
    const remainingColours = this.state.remainingColours;
    let index = 0;

    colours.forEach((item, i) => {
      if (item.color === color) {
        index = i;
      }
    });

    if (index !== -1) {
      colours.splice(index, 1);
    }
    remainingColours.push(color);

    this.setState({
      hoverColor: '',
      colours,
      remainingColours,
    });
  }

  renderAvailableColours() {
    const {remainingColours} = this.state;
    const availableColours = remainingColours.map((colour, index) => {
      const style = {
        color: colour,
      };

      return (
        <span
          key={index}
          className="available-colour"
          style={style}
          onClick={() => this.addColour(colour)}
          onMouseEnter={() => this.onMouseEnterAvailableColour(colour)}
          onMouseLeave={this.onMouseLeaveAvailableColour}
        >
          <i className="fas" />
        </span>
      );
    });

    return (
      <div className="status-field-available-colours">
        {availableColours}
      </div>
    );
  }

  renderColor(colorItem) {
    const style = {
      backgroundColor: colorItem.color,
    };

    return (
      <div className="selected-colour">
        <div className="input-group">
          <div className="input-group-addon" style={style}>&nbsp;</div>
          <input
            type="text"
            className="form-control"
            value={colorItem.label}
            onChange={(evt) => this.handleChange(colorItem, evt)}
          />
        </div>
        <i className="far fa-times-circle" onClick={() => this.deleteColour(colorItem.color)} />
      </div>
    );
  }

  editColours() {
    if (this.state.colours.length) {
      const colours = this.state.colours.map((colorItem, index) => (
        <div key={index}>
          {this.renderColor(colorItem)}
        </div>
      ));

      return (
        <div className="status-field-selected-colours">
          {colours}
        </div>
      );
    }

    return (
      <span>No colours selected</span>
    );
  }

  render() {
    return (
      <div>
        <div className="status-field-items">
          <div>
            {this.editColours()}
            <hr />
            {this.renderAvailableColours()}
          </div>
        </div>
        <div className="status-field-actions" onClick={this.handleClickOnActions}>
          Save
        </div>
      </div>
    );
  }
}

StatusFieldEdit.defaultProps = {};

StatusFieldEdit.propTypes = {
  colours: PropTypes.array,
  remainingColours: PropTypes.array,
  handler: PropTypes.func,
};

export default StatusFieldEdit;
