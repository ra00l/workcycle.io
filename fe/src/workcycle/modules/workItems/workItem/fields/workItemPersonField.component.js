import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import IconMenu from 'material-ui/IconMenu';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';

import {COLOR_ARRAY} from '../../../../contants/colors.constants';
import {updateWorkItemCustomField} from '../../workItems.actions';

class WorkitemPersonField extends Component {

  state = {
    openMenu: false,
    userFilter: '',
  };

  handleOnRequestChange = (value) => {
    this.setState({
      openMenu: value,
    });
  };

  handleOnItemClick = (item) => {
    const {
      boardId,
      dispatch,
      field,
      fieldId,
      workItem,
    } = this.props;
    const newWorkItem = {
      [fieldId]: item.get('id'),
    };

    dispatch(updateWorkItemCustomField(boardId, workItem.get('id'), fieldId, newWorkItem));

    this.setState({
      openMenu: false,
    });
  };

  renderUserIcon = (user = Map()) => {
    const style = {
      fontSize: '16px',
    };

    if (user.get('img')) {
      return (
        <div>
          <Avatar size={34} src={user.get('img')} style={style}/>
        </div>
      );
    }

    let firstLeters = '';
    if (user.get('name')) {
      firstLeters = (user.get('name').match(/\b(\w)/g) || []).join('').toUpperCase();
    }

    const colorIdx = (firstLeters[0] || ' ').charCodeAt(0) % COLOR_ARRAY.length;
    style.backgroundColor = COLOR_ARRAY[colorIdx];

    return (
      <Avatar size={34} style={style}>{firstLeters}</Avatar>
    );
  };

  renderOptions() {
    const {users} = this.props;

    let allUsers = users.get('ids').map(userId => users.getIn(['data', `${userId}`]));
    if (this.state.userFilter) {
      allUsers = allUsers.filter(u =>
        u.get('name').toLowerCase()
          .indexOf(this.state.userFilter.toLowerCase()) > -1);
    }

    const usersMarkup = allUsers.map(user => (
      <ListItem
        key={user.get('id')}
        primaryText={user.get('name')}
        leftAvatar={this.renderUserIcon(user)}
        onClick={() => this.handleOnItemClick(user)}
      />
    ));

    usersMarkup.push(<Divider key="divider"/>);
    usersMarkup.push(
      <ListItem
        key="CLEAR"
        primaryText="No person"
        leftAvatar={this.renderUserIcon(Map())}
        onClick={() => this.handleOnItemClick(Map({id: null}))}
      />
    );

    return (
      <IconMenu
        iconButtonElement={<IconButton style={{width: '1px', height: '1px', padding: 0}}/>}
        open={this.state.openMenu}
        onRequestChange={this.handleOnRequestChange}
      >
        <input
          type="text"
          className="form-control person-search"
          value={this.state.userFilter}
          placeholder="Filter users by name"
          onChange={(e) => this.setState({userFilter: e.target.value})}
        />
        <List>
          {usersMarkup}
        </List>
      </IconMenu>
    );
  }

  handleOpenMenu = () => {
    this.setState({
      openMenu: true,
    });
  };

  renderValue() {
    const {
      field,
      users,
      workItem,
    } = this.props;

    const fieldValue = workItem.get(`${field.get('id')}`) || null;

    if (fieldValue) {
      const user = users.getIn(['data', `${fieldValue}`]);

      return this.renderUserIcon(user);
    }

    return false;
  }

  render() {
    const {field} = this.props;

    const classString = classnames('workitem-field', {
      [`field-${field.get('type')}`]: field.get('type'),
    });

    return (
      <div className={classString}>
        <div className="field-container" onClick={this.handleOpenMenu}>
          {this.renderValue()}
          {this.renderOptions()}
        </div>
      </div>
    );
  }
}

WorkitemPersonField.defaultProps = {};

WorkitemPersonField.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  fieldId: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  users: PropTypes.object.isRequired,
  workItem: PropTypes.object.isRequired,
};

export default connect(state => ({
  users: state.users,
}))(WorkitemPersonField);
