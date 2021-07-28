import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import FlatButton from 'material-ui/FlatButton';

import {createNest} from './nests.actions';

class AddNest extends Component {

  state = {
    nestName: '',
    showInput: false,
  };

  handleChange = (evt) => {
    this.setState({
      nestName: evt.target.value,
    });
  }

  handleKeyUp = (evt) => {
    const {
      boardId,
      dispatch,
    } = this.props;

    const nest = {
      name: this.state.nestName,
    };

    if (evt.keyCode === 13) {
      // reset the field value
      this.setState({
        nestName: '',
        showInput: false,
      });
      dispatch(createNest(boardId, nest));
    }
  }

  handleOnClick = () => {
    this.setState({
      showInput: true,
    });
  }

  handleOnBlur = () => {
    this.setState({
      showInput: false,
      nestName: '',
    });
  }

  render() {
    if (!this.state.showInput) {
      return (
        <div className="container main">
          <div className="form-group" style={{width: '300px'}}>
            <FlatButton
              label="Add nest"
              onClick={this.handleOnClick}
              icon={<i className="fas fa-plus" />}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="container main">
        <div className="form-group" style={{width: '300px'}}>
          <input
            className="form-control"
            placeholder="Add new nest"
            type="text"
            value={this.state.newNestName}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            onBlur={this.handleOnBlur}
            autoComplete="off"
          />
        </div>
      </div>
    );
  }
}

AddNest.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(AddNest);
