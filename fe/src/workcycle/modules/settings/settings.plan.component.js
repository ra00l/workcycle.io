/**
 * @namespace settings.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

class SettingsPlan extends Component {

  render() {
    return (
      <span>
        Plan
      </span>
    );
  }
}

SettingsPlan.propTypes = {
  children: PropTypes.node,
};

export default SettingsPlan;
