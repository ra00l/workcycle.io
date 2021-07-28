/**
 * @namespace navigation.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {Link} from 'react-router';

// services
import navigationService from './navigation.service';
import l10nService from '../l10n/l10n.service';

/**
 * Prefix for logging
 *
 * @private
 * @memberOf navigation.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[navigation.component]';

/**
 * Component that will render Not Found page
 *
 * @class Navigation
 * @memberOf navigation.component
 * @extends React.Component
 *
 */
class Navigation extends Component {

  /**
   * Returns the nav class string
   *
   * @instance
   * @memberOf navigation.component.Navigation
   * @method getNavClassString
   *
   * @return {String} class string
   */
  getNavClassString() {

    return classnames('nav', {
      'nav--opened': this.props.isNavOpened,
    });
  }

  /**
   * Handle click on the nav item
   *
   * @instance
   * @memberOf navigation.component.Navigation
   * @method handleOnClickOnNavItem
   */
  handleOnClickOnNavItem = () => {
    this.props.closeNav();
  }

  /**
   * Render nav item
   *
   * @instance
   * @memberOf navigation.component.Navigation
   * @method renderNavItem
   *
   * @param {Object} item - item to render
   * @param {Number} index - index of the item
   * @return {Object} JSX HTML Content
   */
  renderNavItem(item, index) {
    let linkItem = (<Link to={item.path}>{l10nService.translate(item.labelKey)}</Link>);
    if (item.path.indexOf('http') === 0) {
      linkItem = (<a target="_blank" href={item.path}>{l10nService.translate(item.labelKey)}</a>);
    }

    return (
      <li className="nav-item" key={index} onClick={this.handleOnClickOnNavItem}>
        {linkItem}
      </li>
    );
  }

  /**
   * Render nav items
   *
   * @instance
   * @memberOf navigation.component.Navigation
   * @method renderNavItems
   *
   * @return {Object} JSX HTML Content
   */
  renderNavItems() {
    const {
      company: {
        lastWorkspace,
      },
    } = this.props;
    const navigationItems = navigationService.getNavItems(lastWorkspace);
    const navItems = navigationItems.map((item, index) => this.renderNavItem(item, index));

    return (
      <ul>
        {navItems}
      </ul>
    );
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf navigation.component.Navigation
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    const navItems = [];

    return (
      <nav className={this.getNavClassString()}>
        {this.renderNavItems()}
      </nav>
    );
  }
}

Navigation.defaultProps = {
  company: {},
  closeNav: () => false,
  isNavOpened: false,
};

Navigation.propTypes = {
  company: PropTypes.object,
  closeNav: PropTypes.func,
  isNavOpened: PropTypes.bool,
};

export default connect((state) => ({
  company: state.company,
}))(Navigation);
