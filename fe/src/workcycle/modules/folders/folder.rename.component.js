import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Button from './../../components/button/button.component';

import {Treebeard} from 'react-treebeard';

class RenameFolder extends Component {
  state = {
    folderName: this.props.folderName,
  }

  rename = () => {
    const {folderName} = this.state;

    if (folderName === '') {
      this.props.onCancelHandler();
    } else {
      this.props.onSaveHandler(folderName);
    }
  }

  handleOnChange = (evt) => {
    this.setState({
      folderName: evt.target.value,
    });
  }

  renameFolder = (evt) => {
    if (evt.charCode === 13 || evt.keyCode === 13) {
      if (this.state.inputValue !== '') {
        this.rename();
      }
    }
  }

  renderButtons() {
    return (
      <div className="dependency-modal-actions row">
        <div className="col-xs-6 col-sm-6 text-right">
          <Button
            label="Save"
            onClick={this.rename}
            type="primary"
          />
        </div>
        <div className="col-xs-6 col-sm-6 text-left">
          <Button
            label="Cancel"
            onClick={() => this.props.onCancelHandler()}
            type="secondary"
          />
        </div>
      </div>
    );
  }

  renderInput() {
    return (
      <div className="form-group">
        <input
          type="text"
          className="form-control"
          value={this.state.folderName}
          onChange={this.handleOnChange}
          onKeyPress={this.renameFolder}
          placeholder="folder name"
          ref={(input) => { this.textInput = input; }}
          autoFocus
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <h4>Rename folder</h4>
        <div>
          {this.renderInput()}
        </div>
        {this.renderButtons()}
      </div>
    );
  }
}

RenameFolder.defaultProps = {};

RenameFolder.propTypes = {
  onSaveHandler: PropTypes.func.isRequired,
  onCancelHandler: PropTypes.func.isRequired,
  folderName: PropTypes.string.isRequired,
  folderId: PropTypes.number,
};

export default RenameFolder;
