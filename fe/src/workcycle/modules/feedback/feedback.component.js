/**
 * @namespace feedback.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

// services

// routes

// actions

// components

/**
 * @private
 * @description Prefix for logging
 * @memberOf feedback.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[feedback.component]';

/**
 * Feedback component
 *
 * @class Feedback
 * @memberOf feedback.component
 * @extends React.Component
 *
 * @example
 * <Feedback />
 */
class Feedback extends Component {

  /**
   * Render method
   *
   * @instance
   * @memberOf feedback.component.Feedback
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    return (
      <div>
        Feedback
      </div>
    );
  }
}

Feedback.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

export default Feedback;
