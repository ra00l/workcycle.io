/**
 * @namespace components.alerts
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Alert from './alert.component';

/**
 * @private
 * @description Prefix for logging
 * @memberOf components.alerts
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[alerts.component]';

/**
 * @private
 * @description The maximum number of alerts to display at once
 * @memberOf components.alerts
 * @const {Number}
 * @default
 */
const MAX_ALERTS_AT_A_TIME = 5;

/**
 * @description Component for alerts
 * @class Alerts
 * @extends React.Component
 * @memberOf components.alerts
 */
export class Alerts extends Component {

  /**
   * @description Render
   * @method render
   * @memberOf components.alerts.Alerts
   *
   * @return {JSX|Boolean} content - HTML Content | false
   */
  render() {
    const alertsJsx = this.props.alerts.slice(0, MAX_ALERTS_AT_A_TIME).map((item, index) => (
        (
          <Alert
            key={item.key}
            index={index}
            text={item.text}
            alertType={item.alertType}
          />
        )
      )
    );

    if (alertsJsx) {
      return (
        <div className="alerts-wrapper">{alertsJsx}</div>
      );
    }

    return false;
  }
}

Alerts.propTypes = {
  alerts: PropTypes.array.isRequired,
};

export default connect(state => ({
  alerts: state.alerts,
}))(Alerts);
