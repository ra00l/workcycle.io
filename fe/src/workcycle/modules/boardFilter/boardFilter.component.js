import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Map, List} from 'immutable';
import classnames from 'classnames';
import {browserHistory} from 'react-router';
import * as colors from './../../contants/colors.constants';

// material-ui components
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import ContentFilter from 'material-ui/svg-icons/content/filter-list';
import Avatar from 'material-ui/Avatar';

import {setFilters} from './boardFilter.actions';

class BoardFilter extends Component {
  state = {
    isFilterOpened: false,
    filterMenuRef: null,
    filters: {},
  };
  
  toggleNest(nestId) {
    const {filters} = this.state;
    const nests = filters.nestId || [];
    let newNests = [];
    
    if (nests.indexOf(nestId) === -1) {
      // nest id is not in the array
      newNests = [...nests, nestId];
    } else {
      // nest id is in the array
      newNests = [...nests];
      const index = newNests.indexOf(nestId);
      newNests.splice(index, 1);
    }

    this.setState({
      filters: {
        ...filters,
        nestId: newNests,
      },
    });
  }

  toggleCustomField(fieldId, fieldValue) {
    const {filters} = this.state;
    const currentSelectedValues = filters[fieldId] || [];
    let newSelectedValues = [];
    
    if (currentSelectedValues.indexOf(fieldValue) === -1) {
      // nest id is not in the array
      newSelectedValues = [...currentSelectedValues, fieldValue];
    } else {
      // nest id is in the array
      newSelectedValues = [...currentSelectedValues];
      const index = newSelectedValues.indexOf(fieldValue);
      newSelectedValues.splice(index, 1);
    }

    const newFilters = {
      ...filters,
      [fieldId]: newSelectedValues,
    };

    if (newSelectedValues.length === 0) {
      delete newFilters[fieldId];
    }

    this.setState({
      filters: {
        ...newFilters,
      },
    });
  }

  updateBrowserHistory() {
    const currentLocation = browserHistory.getCurrentLocation();

    // TODO: push the correct string and when the component is mounted dispatch the correct action
    // with the correct filter and on unmount remove the filters

    // browserHistory.push(`${currentLocation.pathname}?filter=TBC`);
  }

  applyFilters = () => {
    // update browser history
    this.updateBrowserHistory();

    // save filtes into the store
    this.props.dispatch(setFilters(this.state.filters));

    // close the filters modal
    this.setState({
      isFilterOpened: false,
      filterMenuRef: null,
    });
  }

  clearFilters = () => {
    this.setState({
      filters: {},
    });
  }

  renderUserIcon = (user = Map()) => {
    const style = {
      fontSize: '16px',
    };

    if (user.get('img')) {
      return (
        <div>
          <Avatar size={20} src={user.get('img')} style={style}/>
        </div>
      );
    }

    let firstLeters = '';
    if (user.get('name')) {
      firstLeters = (user.get('name').match(/\b(\w)/g) || []).join('').toUpperCase();
    }

    const colorIdx = (firstLeters[0] || ' ').charCodeAt(0) % colors.COLOR_ARRAY.length;
    style.backgroundColor = colors.COLOR_ARRAY[colorIdx];

    return (
      <Avatar size={20} style={style}>{firstLeters}</Avatar>
    );
  };

  renderPersonField(field, index) {
    const {users} = this.props;
    const {filters} = this.state;
    const userIds = users.get('ids') || [];
    const fieldId = field.get('id');
    const fieldName = field.get('name');


    if (userIds.length > 0) {
      const personIdFromFilter = filters[fieldId] || [];

      return (
        <li className="filters-list-of-persons" key={`PERSON_${index}`}>
          <h5>{fieldName} ({personIdFromFilter.length})</h5>
          <ul>
            {userIds.map((userId, index) => {
              const user = users.getIn(['data', `${userId}`]) || Map();
              const personIdFromFilter = filters[fieldId] || [];
              const classString = classnames('person-item', {
                'selected': personIdFromFilter.indexOf(userId) !== -1,
              });
  
              return (
                <li key={index} className={classString} onClick={() => this.toggleCustomField(fieldId, userId)}>
                  <div>{this.renderUserIcon(user)}</div>
                  <div>{user.get('name')}</div>
                </li>
              );
            })}
          </ul>
        </li>
      );
    }

    return false;
  }

  renderSelectorField(field, index) {
    const {filters} = this.state;
    const fieldMeta = field.get('meta') || List();
    const fieldName = field.get('name');
    const fieldId = field.get('id');

    if (fieldMeta && fieldMeta.size > 0) {
      const selectorIdFromFilter = filters[fieldId] || [];

      return (
        <li className="filters-list-of-selector" key={`SELECTOR_${index}`}>
          <h5>{fieldName} ({selectorIdFromFilter.length})</h5>
          <ul>
            {fieldMeta.map((meta, index) => {
              
              const selectorColor = meta.get('color');
              const classString = classnames('selector-item', {
                'selected': selectorIdFromFilter.indexOf(meta.get('id')) !== -1,
              });
  
              return (
                <li key={index} className={classString} onClick={() => this.toggleCustomField(fieldId, meta.get('id'))}>
                  <div style={{color: selectorColor}}>{meta.get('label')}</div>
                </li>
              );
            })}
          </ul>
        </li>
      );
    }

    return false;
  }

  renderNests() {
    const {nests} = this.props;
    const {filters} = this.state;
    const nestsIds = nests.get('sorted');

    if (nestsIds && nestsIds.size > 0) {
      const nestIdFromFilter = filters.nestId || [];

      return (
        <li className="filters-list-of-nests" key="NEST">
          <h5>Nests ({nestIdFromFilter.length})</h5>
          <ul>
            {nestsIds.map((nestId, index) => {
              const nest = nests.getIn(['data', `${nestId}`]) || Map();
              const nestColor = nest.get('color') ? colors[nest.get('color').toUpperCase()] : colors.PURE_BLUE;
              const classString = classnames('nest-item', {
                'selected': nestIdFromFilter.indexOf(nestId) !== -1,
              });
  
              return (
                <li key={index} className={classString} onClick={() => this.toggleNest(nestId)}>
                  <div style={{color: nestColor}}>{nest.get('name')}</div>
                  {/* <div>{nest.get('sortedWorkItems').size}</div> */}
                </li>
              );
            })}
          </ul>
        </li>
      );
    }

    return false;
  }

  renderAvailableFilters() {
    const nests = this.renderNests();
    const {fields} = this.props;
    const customFields = [];

    fields.get('sorted').forEach((fieldId, index) => {
      if (fieldId !== 'TITLE') {
        const field = fields.getIn(['data', `${fieldId}`]) || Map();
        const fieldType = field.get('type');

        if (fieldType && fieldType === 'person') {
          const fieldMarkup = this.renderPersonField(field, index);
  
          customFields.push(fieldMarkup);
        }

        if (fieldType && fieldType === 'selector') {
          const fieldMarkup = this.renderSelectorField(field, index);
  
          customFields.push(fieldMarkup);
        }
      }
    });

    return (
      <div>
        <ul className="list-inline flex">
          {nests}
          {customFields}
        </ul>
      </div>
    );
  }

  renderFilter() {
    return (
      <div className="board-add">
        <IconButton onClick={this.openFilterMenu}><ContentFilter /></IconButton>
        <Popover
          open={this.state.isFilterOpened}
          anchorEl={this.state.filterMenuRef}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.closeAddMenu}
        >
          <div className="filters-container">
            <div className="filters-header">
              <h4>Filter your board</h4>
              <div>
                <ul className="list-inline">
                  <li className="list-item" onClick={this.clearFilters}>Clear</li>
                </ul>
              </div>
            </div>

            <div className="filters-content">
              {this.renderAvailableFilters()}
            </div>

            <div className="filters-actions">
              <button className="button button--primary" onClick={this.applyFilters}>Apply filters</button>
            </div>
          </div>
        </Popover>
      </div>
    );
  }

  openFilterMenu = (event) => {
    this.setState({
      isFilterOpened: true,
      filterMenuRef: event.currentTarget,
    });
  }

  closeAddMenu = () => {
    this.setState({
      isFilterOpened: false,
      filterMenuRef: null,
    });
  }

  render() {
    return (
      <div>
        {this.renderFilter()}
      </div>
    );
  }
}

BoardFilter.defaultProps = {};

BoardFilter.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fields: PropTypes.object.isRequired,
  nests: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired,
};

export default connect((state) => ({
  fields: state.fields,
  nests: state.nests,
  users: state.users,
}))(BoardFilter);
