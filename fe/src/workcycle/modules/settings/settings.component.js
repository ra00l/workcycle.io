/**
 * @namespace settings.component
 */

import React, {Component} from 'react';
import {Link} from 'react-router';
import PropTypes from 'prop-types';

class Settings extends Component {

  render() {
    const planName = 'FREE';

    return (
      <div className="container main">
        <ul className="accountMenu">
          <li><Link to={'/settings/account'} activeClassName="active">Account</Link></li>
          <li><Link to={'/settings/workspace'} activeClassName="active">Workspaces</Link></li>
          {/* <li><Link to={'/settings/billing'} activeClassName="active">Billing</Link></li>
          <li><Link to={'/settings/plan'} activeClassName="active">Plan ({planName})</Link></li> */}
        </ul>
        {this.props.children}
      </div>
    );
  }
}

Settings.propTypes = {
  children: PropTypes.node,
};

export default Settings;
