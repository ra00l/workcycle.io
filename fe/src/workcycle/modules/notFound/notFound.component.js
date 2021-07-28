/**
 * @namespace notFound.component
 */

import React, {Component} from 'react';

// services

/**
 * Prefix for logging
 *
 * @private
 * @memberOf notFound.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[notFound.component]';

/**
 * Component that will render Not Found page
 *
 * @class NotFound
 * @memberOf notFound.component
 * @extends React.Component
 *
 */
class NotFound extends Component {

  /**
   * Render method
   *
   * @instance
   * @memberOf notFound.component.NotFound
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    return (
      <div className="page-not-found">
        <h1>404_NOT_FOUND_TITLE</h1>
      </div>
    );
  }
}

export default NotFound;
