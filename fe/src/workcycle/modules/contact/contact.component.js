/**
 * @namespace contact.component
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
 * @memberOf contact.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[contact.component]';

/**
 * Contact component
 *
 * @class Contact
 * @memberOf contact.component
 * @extends React.Component
 *
 * @example
 * <Contact />
 */
class Contact extends Component {

  /**
   * Render method
   *
   * @instance
   * @memberOf contact.component.Contact
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    return (
      <div>
        contact
      </div>
    );
  }
}

Contact.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

export default Contact;
