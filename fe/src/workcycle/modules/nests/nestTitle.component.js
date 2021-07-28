/**
 * @namespace nestTitle.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// material ui components
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import Download from 'material-ui/svg-icons/file/file-download';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Dialog from 'material-ui/Dialog';

import DuplicateNest from './nest.duplicateNestForm.component';
import MoveNest from './nest.moveNestForm.component';

import l10nService from '../l10n/l10n.service';
import {
  showDialog,
  showConfirmationDialog,
} from '../dialog/dialog.actions';
import {
  removeNest,
  updateNest,
} from './nests.actions';

import * as colors from '../../contants/colors.constants';

class NestTitle extends Component {

  state = {
    nestName: '',
    editState: false,
    showDeleteModal: false,
  }

  componentWillMount() {
    this.setState({
      nestName: this.props.nest.get('name'),
    });
  }

  componentWillReceiveProps(nestProps) {
    this.setState({
      nestName: nestProps.nest.get('name'),
    });
  }

  handleClickOnTitle = () => {
    this.props.handleCollapse();
  };

  handleClickOnDropdownItem = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;

    switch (value) {
      case 'EDIT':
        this.setState({
          editState: !this.state.editState,
        });
        break;
      case 'REMOVE':

        this.setState({
          showDeleteModal: true,
        });
        break;
      case 'DUPLICATE':
        this.handleDuplicateNest();
        break;
      case 'MOVE_TO':
        this.handleMoveNest();
        break;
    }
  };

  handleChangeColor(color) {
    const {
      boardId,
      dispatch,
      nest,
    } = this.props;

    dispatch(updateNest(boardId, nest.get('id'), {
      color,
    }));
  }

  handleDuplicateNest() {
    const {
      boardId,
      nest,
      dispatch,
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <DuplicateNest
          boardId={boardId}
          dispatch={dispatch}
          nestId={nest.get('id')}
        />
      ),
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  handleMoveNest() {
    const {
      boardId,
      nest,
      dispatch,
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <MoveNest boardId={boardId} nestId={nest.get('id')} nest={nest} />
      ),
      className: 'move-nest',
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  }

  handleRemoveNest() {
    const {
      boardId,
      dispatch,
      nest,
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <div>
          <h4 className="confirmation-message">Delete nest</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following nest
            <span className="text--italic"> {this.props.nest.get('name')}</span> ?
            Please be aware that everything will be lost and you can't undo this action.
          </p>
        </div>
      ),
    };

    const buttons = {
      clickCb: () => dispatch(removeNest(boardId, nest.get('id'))),
      label: 'Delete',
    };

    dispatch(showConfirmationDialog(options, buttons));
  }

  handleChangeOnEditNestName = (evt) => {
    this.setState({
      nestName: evt.target.value,
    });
  };

  handleKeyUpOnEditNestName = (evt) => {
    const {
      boardId,
      dispatch,
      nest,
    } = this.props;

    if (evt.keyCode === 13) {
      dispatch(updateNest(boardId, nest.get('id'), {
        name: this.state.nestName,
      }));
    }

    if (evt.keyCode === 13 || evt.keyCode === 27) {
      this.setState({
        editState: false,
      });
    }
  };

  renderLabelForColor(colorName) {
    const style = {
      color: colors[colorName.toUpperCase()],
      marginRight: '6px',
    };

    return (
      <span>
        <i className="fas fa-circle" style={style} /> {colorName.replace('_', ' ')}
      </span>
    );
  }

  renderDragIcon() {
    const {nest} = this.props;
    const color = nest.get('color') ? colors[nest.get('color').toUpperCase()] : colors.PURE_BLUE;
    const style = {
      color,
    };

    return (
      <span className="nest-title--drag-icon" style={style}>
        <i className="fas fa-ellipsis-v" />
        <i className="fas fa-ellipsis-v" />
      </span>
    );
  }

  renderCollapseIcon() {
    const {
      collapsed,
      nest,
    } = this.props;
    const classString = classnames('fas', {
      'fa-chevron-circle-down': !collapsed,
      'fa-chevron-circle-right': collapsed,
    });
    const color = nest.get('color') ? colors[nest.get('color').toUpperCase()] : colors.PURE_BLUE;
    const style = {
      color,
    };

    return (
      <span className="nest-title--collapse-icon" style={style} onClick={() => this.props.handleCollapse()}>
        <i className={classString} />
      </span>
    );
  }

  changeColorToBlack = () => {
    this.handleChangeColor('BLACK');
  }

  changeColorToStrongGreen = () => {
    this.handleChangeColor('STRONG_GREEN');
  }

  changeColorToPureBlue = () => {
    this.handleChangeColor('PURE_BLUE');
  }

  changeColorToDesaturatedViolet = () => {
    this.handleChangeColor('DESATURATED_VIOLET');
  }

  changeColorToVividOrange = () => {
    this.handleChangeColor('VIVID_ORANGE');
  }

  changeColorToStrongYellow = () => {
    this.handleChangeColor('STRONG_YELLOW');
  }

  changeColorToLightRed = () => {
    this.handleChangeColor('LIGHT_RED');
  }

  changeColorToModerateCyan = () => {
    this.handleChangeColor('MODERATE_CYAN');
  }

  changeColorToSoftMagenta = () => {
    this.handleChangeColor('SOFT_MAGENTA');
  }

  renderDeleteModal() {
    const {
      boardId,
      dispatch,
      nest,
    } = this.props;

    if (!this.state.showDeleteModal) {
      return null;
    }

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
          <h4 className="confirmation-message">Delete nest</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following nest
            <span className="text--italic"> {this.props.nest.get('name')}</span> ?
            Please be aware that everything will be lost and you can't undo this action.
          </p>
          <div className="dialog-footer">
            <button
              type="button"
              className="button button--primary"
              onClick={() => {
                dispatch(removeNest(boardId, nest.get('id')));
                this.setState({showDeleteModal: false});
              }}
            >Ok</button>
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

  renderActions() {
    return (
      <span className="nest-title--actions">
        <IconMenu
          iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
          anchorOrigin={{horizontal: 'left', vertical: 'top'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onItemClick={this.handleClickOnDropdownItem}
        >
          <MenuItem primaryText={!this.state.editState ? 'Edit' : 'Cancel edit'} value="EDIT" />
          <MenuItem primaryText="Clone" value="DUPLICATE" />
          <MenuItem primaryText="Move to another board" value="MOVE_TO" />
          <MenuItem
            primaryText="Change color"
            rightIcon={<ArrowDropRight />}
            menuItems={[
              <MenuItem
                key="COLOR_1"
                onClick={this.changeColorToBlack}
                primaryText={this.renderLabelForColor('black')}
                value="BLACK"
              />,
              <MenuItem
                key="COLOR_2"
                onClick={this.changeColorToStrongGreen}
                primaryText={this.renderLabelForColor('strong_green')}
                value="STRONG_GREEN"
              />,
              <MenuItem
                key="COLOR_3"
                onClick={this.changeColorToPureBlue}
                primaryText={this.renderLabelForColor('pure_blue')}
                value="PURE_BLUE"
              />,
              <MenuItem
                key="COLOR_4"
                onClick={this.changeColorToDesaturatedViolet}
                primaryText={this.renderLabelForColor('desaturated_violet')}
                value="DESATURATED_VIOLET"
              />,
              <MenuItem
                key="COLOR_5"
                onClick={this.changeColorToVividOrange}
                primaryText={this.renderLabelForColor('vivid_orange')}
                value="VIVID_ORANGE"
              />,
              <MenuItem
                key="COLOR_6"
                onClick={this.changeColorToStrongYellow}
                primaryText={this.renderLabelForColor('strong_yellow')}
                value="STRONG_YELLOW"
              />,
              <MenuItem
                key="COLOR_7"
                onClick={this.changeColorToLightRed}
                primaryText={this.renderLabelForColor('light_red')}
                value="LIGHT_RED"
              />,
              <MenuItem
                key="COLOR_8"
                onClick={this.changeColorToModerateCyan}
                primaryText={this.renderLabelForColor('moderate_cyan')}
                value="MODERATE_CYAN"
              />,
              <MenuItem
                key="COLOR_9"
                onClick={this.changeColorToSoftMagenta}
                primaryText={this.renderLabelForColor('soft_magenta')}
                value="SOFT_MAGENTA"
              />,
            ]}
          />
          <Divider />
          <MenuItem primaryText="Remove" value="REMOVE" />
        </IconMenu>
      </span>
    );
  }

  renderTheNumberOfWorkItems() {
    const {nest} = this.props;

    if (!nest.get('sortedWorkItems')) {
      return false;
    }

    const workItemsCount = nest.get('sortedWorkItems').size;
    let workItemsText = l10nService.translate('WORKITEMS.COUNT.MANY');
    if (workItemsCount === 1) {
      workItemsText = l10nService.translate('WORKITEMS.COUNT.ONE');
    }

    return (
      <span className="badge badge-secondary">
        {workItemsCount} {workItemsText}
      </span>
    );
  }

  renderNestName() {
    const {nest} = this.props;
    const color = nest.get('color') ? colors[nest.get('color').toUpperCase()] : colors.PURE_BLUE;
    const style = {color};

    if (this.state.editState) {
      return false;
    }

    return (
      <span className="nest-title" onClick={this.handleClickOnTitle} style={style}>
        {nest.get('name')} {this.renderTheNumberOfWorkItems()}
        <a name={`nest-${nest.get('id')}`} />
      </span>
    );
  }

  renderNestNameEdit() {
    if (!this.state.editState) {
      return false;
    }

    return (
      <div className="form-group" style={{marginBottom: 0}}>
        <input
          className="form-control"
          placeholder="Nest name"
          type="text"
          value={this.state.nestName}
          onChange={this.handleChangeOnEditNestName}
          onKeyUp={this.handleKeyUpOnEditNestName}
          autoComplete="off"
        />
      </div>
    );
  }

  render() {
    return (
      <div className="nest-title-container flex-center">
        {this.renderDragIcon()}
        {this.renderCollapseIcon()}
        {this.renderNestName()}
        {this.renderNestNameEdit()}
        {this.renderActions()}
        {this.renderDeleteModal()}
      </div>
    );
  }
}

NestTitle.propTypes = {
  boardId: PropTypes.string,
  dispatch: PropTypes.func,
  nest: PropTypes.object,
  handleCollapse: PropTypes.func,
  collapsed: PropTypes.bool,
};

export default NestTitle;
