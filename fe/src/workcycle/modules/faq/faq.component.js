/**
 * @namespace faq.component
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
 * @memberOf faq.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[faq.component]';

/**
 * FAQ component
 *
 * @class FAQ
 * @memberOf faq.component
 * @extends React.Component
 *
 * @example
 * <FAQ />
 */
class FAQ extends Component {

  /**
   * Render method
   *
   * @instance
   * @memberOf faq.component.FAQ
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    return (
      <div>
        FAQ
      </div>
    );
  }
}

FAQ.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

export default FAQ;
