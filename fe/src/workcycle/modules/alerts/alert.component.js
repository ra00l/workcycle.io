/**
 * @namespace alert.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';

// services
import browserUtilsService from '../../services/browser.util.service';

// constants
import {
  DANGER,
  INFO,
  SUCCESS,
  WARNING,
} from './alert.constants';

// actions
import {removeAlert} from './alert.actions';

/**
 * Prefix for logging
 *
 * @default
 * @private
 * @const {String}
 * @memberOf alert.component
 */
const LOG_PREFIX = '[alert.component]';

/**
 * Component for alert messages
 *
 * @class Alert
 * @extends React.Component
 * @memberOf alert.component
 */
export class Alert extends Component {

  /**
   * React lifecycle method - componentWillMount
   *
   * @instance
   * @method componentWillMount
   * @memberOf alert.component.Alert
   */
  componentWillMount() {
    this.setup();
  }

  /**
   * React lifecycle method -  componentWillUnmount
   *
   * @instance
   * @method componentWillUnmount
   * @memberOf alert.component.Alert
   */
  componentWillUnmount() {
    this.cleanup();
  }

  /**
   * Own properties for component
   *
   * @default
   * @instance
   * @const {Object}
   * @name ownProps
   * @memberOf alert.component.Alert
   */
  ownProps = {
    dismissTimeoutId: -1,
    dismissTimeouts: {
      [DANGER]: 0, // add 0 if we do not want that this alert to be automatically dismissed
      [INFO]: 5000,
      [SUCCESS]: 5000,
      [WARNING]: 5000,
    },
    possibleAlerts: [
      DANGER,
      INFO,
      SUCCESS,
      WARNING,
    ],
  };

  /**
   * Setup, it will set alert to be automatically dispatched if it needs.
   *
   * @instance
   * @method setup
   * @memberOf alert.component.Alert
   */
  setup() {
    const isKnownAlert = this.ownProps.possibleAlerts.includes(this.props.alertType);
    const alertType = isKnownAlert ? this.props.alertType : INFO;
    const dismissTimeout = this.ownProps.dismissTimeouts[alertType];
    if (dismissTimeout !== 0) {
      // 0 means the alert should not auto dismiss
      this.ownProps.dismissTimeoutId = browserUtilsService.setTimeout(this.dismissAlert, dismissTimeout);
    }
  }

  /**
   * Cleanup, called at unmount, clears timeout
   *
   * @instance
   * @method cleanup
   * @memberOf alert.component.Alert
   */
  cleanup() {
    if (this.ownProps.dismissTimeoutId !== -1) {
      // clear timeouts ...
      browserUtilsService.clearTimeout(this.ownProps.dismissTimeoutId);
    }
  }

  /**
   * Returns the correct css class for the alert type
   *
   * @instance
   * @method getAlertClass
   * @memberOf alert.component.Alert
   *
   * @return {String}
   */
  getAlertClass() {
    const {alertType} = this.props;

    const isKnownAlert = this.ownProps.possibleAlerts.includes(alertType);
    const type = isKnownAlert ? alertType : INFO;

    return classnames('alert', {
      [`alert-${type}`]: true,
    });
  }

  /**
   * Click handler for the close icon
   *
   * @instance
   * @method dismissAlert
   * @memberOf alert.component.Alert
   */
  dismissAlert = () => {
    const {
      dispatch,
      index,
    } = this.props;

    dispatch(removeAlert(index));
  };

  /**
   * React lifecycle method, render
   *
   * @instance
   * @method render
   * @memberOf alert.component.Alert
   *
   * @return {JSX}
   */
  render() {
    return (
      <div className={this.getAlertClass()} onClick={this.dismissAlert}>
        {this.props.text}
        <i className="fa fa-times" />
      </div>
    );
  }
}

Alert.propTypes = {
  alertType: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
};

export default connect()(Alert);
