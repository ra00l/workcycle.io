import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Map} from 'immutable';
import {connect} from 'react-redux';
import classnames from 'classnames';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Dialog from 'material-ui/Dialog';

// actions
import {
  updateField,
  deleteField,
  cloneField,
} from './fields.actions';

// components
import {RIEInput} from 'riek';

class Field extends Component {

  state = {
    fieldName: this.props.field.get('name'),
    showDeleteModal: false,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      fieldName: nextProps.field.get('name'),
    });
  }

  handleClickOnDropdownItem = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;

    switch (value) {
      case 'REMOVE_FIELD':
        // this.handleClickOnDeleteIcon();
        this.setState({showDeleteModal: true});
        break;
      case 'CLONE_FIELD':
        this.cloneField();
        break;
    }
  };

  onChangeHandlerForTextField = (newChangeObject) => {
    const {
      boardId,
      dispatch,
      field,
      workspaceId,
    } = this.props;
    const newField = {
      ...field.toJS(),
      name: newChangeObject.fieldValue,
    };

    this.setState({
      fieldName: newChangeObject.fieldValue,
    });

    dispatch(updateField(workspaceId, boardId, field.get('id'), newField));
  };

  cloneField() {
    const {
      boardId,
      dispatch,
      field,
      workspaceId,
    } = this.props;

    dispatch(cloneField(workspaceId, boardId, field.get('id')));
  }

  deleteField = () => {
    const {
      boardId,
      dispatch,
      field,
      workspaceId,
    } = this.props;

    dispatch(deleteField(workspaceId, boardId, field.get('id')));
    this.setState({showDeleteModal: false});
  }

  setVisibleInBoard = () => {
    const {
      boardId,
      dispatch,
      field,
      workspaceId,
    } = this.props;
    const visibilityToSet = {
      board: true,
      detail: true,
    };

    if (field.get('visibility')) {
      visibilityToSet.board = !field.get('visibility').get('board');
      visibilityToSet.detail = field.get('visibility').get('detail');
    } else {
      visibilityToSet.board = false;
    }

    const newField = {
      ...field.toJS(),
      visibility: visibilityToSet,
    };

    // at least one must be set
    if (visibilityToSet.board || visibilityToSet.detail) {
      dispatch(updateField(workspaceId, boardId, field.get('id'), newField));
    }
  }

  setVisibleInDetailed = () => {
    const {
      boardId,
      dispatch,
      field,
      workspaceId,
    } = this.props;
    const visibilityToSet = {
      board: true,
      detail: true,
    };

    if (field.get('visibility')) {
      visibilityToSet.board = field.get('visibility').get('board');
      visibilityToSet.detail = !field.get('visibility').get('detail');
    } else {
      visibilityToSet.detail = false;
    }

    const newField = {
      ...field.toJS(),
      visibility: visibilityToSet,
    };

    // at least one must be set
    if (visibilityToSet.board || visibilityToSet.detail) {
      dispatch(updateField(workspaceId, boardId, field.get('id'), newField));
    }
  }

  isFieldVisible() {
    const {
      field,
      visibleIn,
    } = this.props;
    const isVisible = true;

    if (field && field.get('visibility')) {
      if (visibleIn === 'BOARD') {
        return field.get('visibility').get('board');
      }

      return field.get('visibility').get('detail');
    }

    return isVisible;
  }

  renderLabelVisibleIn(visibleIn) {
    const {field} = this.props;
    const style = {
      marginRight: '6px',
    };
    const fieldVisibility = field.get('visibility');
    let iconClass = 'fas fa-eye';

    if (fieldVisibility) {
      if (visibleIn === 'BOARD' && !fieldVisibility.get('board')) {
        iconClass = 'fas fa-eye-slash';
      }

      if (visibleIn === 'DETAILED' && !fieldVisibility.get('detail')) {
        iconClass = 'fas fa-eye-slash';
      }
    }

    return (
      <span>
        <i className={iconClass} style={style} /> {visibleIn === 'BOARD' ? 'board' : 'work item view'}
      </span>
    );
  }

  renderDeleteModal() {
    const {
      field,
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
          <h4 className="confirmation-message">Delete field</h4>
          <p className="confirmation-message-detail">
            Are you sure you want to delete the following field
            <span className="text--italic"> {field.get('name')}</span> ?
            Please be aware that every information that the field is holding will be lost.
          </p>
          <div className="dialog-footer">
            <button type="button" className="button button--primary" onClick={this.deleteField}>Ok</button>
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

  render() {
    const {field} = this.props;
    const classString = classnames('fields-list-item', {
      [`fields-list-item-${field.get('type')}`]: field.get('id') !== 'TITLE',
      'fields-list-item-short-text-title': field.get('id') === 'TITLE',
    });
    const isVisible = this.isFieldVisible();

    if (field.size > 0 && isVisible) {
      return (
        <div className={classString}>
          <div className="flex-center-space-between">
            <div>
              <span className="field-title--drag-icon">
                {field.get('id') !== 'TITLE' ? <i className="fas fa-ellipsis-v" /> : false}
                {field.get('id') !== 'TITLE' ? <i className="fas fa-ellipsis-v" /> : false}
              </span>
            </div>
            <div className="flex-1">
              <RIEInput
                change={this.onChangeHandlerForTextField}
                value={this.state.fieldName}
                propName="fieldValue"
                className="field-name-placeholder"
                classEditing="field-name-edit"
              />
            </div>
            <div>
              <span className="field-actions-menu">
                <IconMenu
                  iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                  anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                  targetOrigin={{horizontal: 'right', vertical: 'top'}}
                  onItemClick={this.handleClickOnDropdownItem}
                >
                  <MenuItem primaryText="Clone field" value="CLONE_FIELD" />
                  <MenuItem
                    primaryText="Visible in"
                    rightIcon={<ArrowDropRight />}
                    menuItems={[
                      <MenuItem
                        key="BOARD"
                        onClick={this.setVisibleInBoard}
                        primaryText={this.renderLabelVisibleIn('BOARD')}
                        value="BOARD"
                      />,
                      <MenuItem
                        key="DETAILED"
                        onClick={this.setVisibleInDetailed}
                        primaryText={this.renderLabelVisibleIn('DETAILED')}
                        value="DETAILED"
                      />,
                    ]}
                  />
                  <Divider />
                  <MenuItem primaryText="Delete" value="REMOVE_FIELD" />
                </IconMenu>
              </span>
            </div>
          </div>
          {this.renderDeleteModal()}
        </div>
      );
    }

    return false;
  }
}

Field.defaultProps = {
  visibleIn: 'BOARD',
};

Field.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  visibleIn: PropTypes.string.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

export default connect((state, props) => {
  const companyStore = state.company;
  const fieldStore = state.fields;
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;
  let field = fieldStore.getIn(['data', `${props.fieldId}`]) || Map();
  
  if (field.size === 0 && props.fieldId === 'TITLE') {
    field = Map({
      name: 'Work item',
      type: 'short-text-title',
      id: 'TITLE',
    });
  }

  return {
    field,
    workspaceId,
  };
})(Field);
