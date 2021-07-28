/**
 * @namespace settings.billing.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

class SettingsBilling extends Component {

  render() {
    return (
      <span>
        Billing
      </span>
    );
  }
}

SettingsBilling.propTypes = {
  children: PropTypes.node,
};

export default SettingsBilling;
