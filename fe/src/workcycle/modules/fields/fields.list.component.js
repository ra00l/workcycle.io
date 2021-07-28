import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {createField} from './fields.actions';

// material ui components
import Field from './field.component';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentTextFormat from 'material-ui/svg-icons/content/text-format';
import ActionDateRange from 'material-ui/svg-icons/action/date-range';
import ActionTimeLine from 'material-ui/svg-icons/action/timeline';

import {
  Droppable,
  Draggable,
} from 'react-beautiful-dnd';

class FieldsList extends Component {

  state = {
    openMenu: false,
  };

  handleOnRequestChange = (value) => {
    this.setState({
      openMenu: value,
    });
  }

  handleOnItemClick = (evt, item) => {
    const {
      props: {
        value,
      },
    } = item;
    const {
      boardId,
      dispatch,
      workspaceId,
    } = this.props;
    let fieldName = value.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    if (value === 'selector') {
      fieldName = 'Status';
    }

    const field = {
      originalType: value,
      type: value,
      name: fieldName,
    };

    dispatch(createField(workspaceId, boardId, field));

    this.setState({
      openMenu: false,
    });
  }

  handleOpenMenu = () => {
    this.setState({
      openMenu: true,
    });
  }

  renderAddNewField() {
    return (
      <IconMenu
        iconButtonElement={this.renderAddNewFieldTitle()}
        open={this.state.openMenu}
        onRequestChange={this.handleOnRequestChange}
        onItemClick={this.handleOnItemClick}
        className="add-new-field-type"
      >
        <MenuItem
          value="date"
          primaryText="Date"
          disabled={false}
          leftIcon={<i className="far fa-calendar-alt" style={{top: '4px'}} />}
        />
        <MenuItem
          value="number"
          primaryText="Number"
          disabled={false}
          leftIcon={<i className="fas fa-sort-numeric-up" style={{top: '4px'}} />}
        />
        <MenuItem
          value="short-text"
          primaryText="Short Text"
          leftIcon={<i className="fas fa-font" style={{top: '3px'}} />}
        />
        <MenuItem
          value="person"
          primaryText="Person"
          disabled={false}
          leftIcon={<i className="fas fa-user" style={{top: '3px'}} />}
        />
        <MenuItem
          value="timeline"
          primaryText="Timeline"
          disabled={false}
          leftIcon={<i className="fas fa-map-signs" style={{top: '4px'}} />}
        />
        <MenuItem
          value="selector"
          primaryText="Status"
          disabled={false}
          leftIcon={<i className="far fa-check-circle" style={{top: '4px'}} />}
        />
        <MenuItem
          value="external-link"
          primaryText="External Link"
          disabled={false}
          leftIcon={<i className="fas fa-external-link-alt" style={{top: '3px'}} />}
        />
        <MenuItem
          value="percentage"
          primaryText="Percentage"
          disabled={false}
          leftIcon={<i className="fas fa-percent" style={{top: '4px'}} />}
        />
        <MenuItem
          value="dependency"
          primaryText="Dependency"
          disabled={false}
          leftIcon={<i className="fas fa-sitemap" style={{top: '4px'}} />}
        />
        {/* <MenuItem
          value="tag"
          primaryText="Label / tag"
          disabled={true}
          leftIcon={<i className="fas fa-tag" style={{top: '4px'}} />}
        />
        <MenuItem
          value="reminder"
          primaryText="Reminder"
          disabled={true}
          leftIcon={<i className="far fa-bell" style={{top: '3px'}} />}
        />
        <MenuItem
          value="checklist"
          primaryText="Checklist"
          disabled={true}
          leftIcon={<i className="fas fa-list" style={{top: '4px'}} />}
        /> */}
      </IconMenu>
    );
  }

  renderAddNewFieldTitle() {
    return (
      <FlatButton
        backgroundColor="transparent"
        label="Add field"
        onClick={this.handleOpenMenu}
        icon={<i className="fas fa-plus" />}
        style={{color: '#0095FF'}}
      />
    );
  }

  getItemStyle = (draggableStyle, isDragging) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // change background colour if dragging
    background: 'transparent',
    display: 'inline-block',
    // styles we need to apply on draggables
    ...draggableStyle,
    // marginRight: '16px',
  });

  isFieldVisible(field) {
    const isVisible = true;

    if (field && field.get('visibility')) {
      const fieldVisibility = field.get('visibility');
      return fieldVisibility.get('board');
    }

    return isVisible;
  }

  renderFields() {
    const {
      boardId,
      fieldOrder,
      fields,
      nestId,
    } = this.props;

    const TITLE_ID = 'TITLE';
    const titleId = fieldOrder.find(id => id === TITLE_ID) || TITLE_ID;

    // title field must be the first one
    const fieldArray = [titleId, ...fieldOrder.filter(id => id !== TITLE_ID)];

    const fieldsMarkup = fieldArray.map((fieldId, index) => {
      const key = `FIELD-${index}-${fieldId}`;
      const isDragDisabled = fieldId === TITLE_ID ? true : false;
      const draggableId = `DRAGGABLE_FIELD_${fieldId}_FROM_NEST_${nestId}`;
      const field = fields.get(`${fieldId}`);

      if (this.isFieldVisible(field)) {
        return (
          <Draggable key={fieldId} draggableId={draggableId} type="FIELD" isDragDisabled={isDragDisabled}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={this.getItemStyle(provided.draggableStyle, snapshot.isDragging)}
                className="field-header"
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <Field
                  key={key}
                  boardId={boardId}
                  fieldId={fieldId}
                  visibleIn="BOARD"
                />
                {provided.placeholder}
              </div>
            )}
          </Draggable>
        );
      }

      return false;
    });

    return fieldsMarkup;
  }

  render() {
    const {nestId} = this.props;

    const droppableId = `DROPPABLE_FIELD_LIST_FOR_NEST_${nestId}`;
    const draggableId = `DRAGGABLE_FIELD_ADD_NEW_FIELD_FROM_NEST_${nestId}`;
    return (
      <div className="fields-list container">
        <div>
          <Droppable droppableId={droppableId} type="FIELD" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {this.renderFields()}
                <Draggable draggableId={draggableId} type="FIELD" isDragDisabled={true}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={this.getItemStyle(provided.draggableStyle, snapshot.isDragging)}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="fields-list-item fields-list-item-add-field">
                        {this.renderAddNewField()}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Draggable>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    );
  }
}

FieldsList.defaultProps = {};

FieldsList.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func,
  fieldOrder: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  nestId: PropTypes.number.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

export default connect((state, props) => {
  const companyStore = state.company;
  const fieldStore = state.fields;
  const fieldOrder = fieldStore.get('sorted');
  const fields = fieldStore.get('data') || Map();
  const workspaceId = companyStore && companyStore.lastWorkspace || 0;

  return {
    fieldOrder,
    workspaceId,
    fields,
  };
})(FieldsList);
