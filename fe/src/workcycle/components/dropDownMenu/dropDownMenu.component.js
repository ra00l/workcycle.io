import React, {Component} from 'react';
import PropTypes from 'prop-types';

// components
import DropdownMenu, {NestedDropdownMenu} from 'react-dd-menu';

class DropDown extends Component {

  /**
   * Component state
   *
   * @instance
   * @memberOf dropDownMenu.component.DropDownMenu
   * @const state
   * @default
   */
  state = {
    isMenuOpen: false,
  };

  /**
   * Toggle menu
   *
   * @instance
   * @memberOf dropDownMenu.component.DropDownMenu
   * @method toggleMenu
   */
  toggleMenu = () => {
    this.setState({
      isMenuOpen: !this.state.isMenuOpen,
    });
  }

  /**
   * Close callback
   *
   * @instance
   * @memberOf dropDownMenu.component.DropDownMenu
   * @method close
   */
  close = () => {
    this.setState({
      isMenuOpen: false,
    });
  }

  /**
   * Click on a menu item
   *
   * @instance
   * @memberOf dropDownMenu.component.DropDownMenu
   * @method clickMenuItem
   *
   * @param {Object} item - current item
   */
  clickMenuItem = (item) => {
    if (item.onClick) {
      // we have custom onClick handler
      // item.onClick();
    } else {
      this.props.onItemClick(item.id);
    }
  }

  /**
   * Render menu item
   *
   * @instance
   * @memberOf dropDownMenu.component.DropDownMenu
   * @method renderItem
   *
   * @param {Object} currentItem - current item
   * @return {Object} JSX HTML Content
   */
  renderItem(currentItem) {
    let icon = false;

    if (currentItem.iconClass) {
      icon = (<i className={`dd-item-ignore ${currentItem.iconClass}`} />);
    }

    if (currentItem.items && currentItem.items.length) {
      const nestedProps = {
        toggle: <a key={currentItem.id}>{currentItem.label}</a>,
        animate: true,
      };

      const content = currentItem.items.map(item => this.renderItem(item));

      return (
        <NestedDropdownMenu key={currentItem.id} {...nestedProps}>
          {content}
        </NestedDropdownMenu>
      );
    }

    return (
      <li key={currentItem.id} onClick={() => this.clickMenuItem(currentItem)} className={currentItem.itemClass}>
        {icon}
        {currentItem.label}
      </li>
    );
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf dropDownMenu.component.DropDownMenu
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    const {align} = this.props;
    const menuOptions = {
      isOpen: this.state.isMenuOpen,
      close: this.close,
      toggle: <i className="fa fa-chevron-circle-down" onClick={this.toggleMenu} />,
      align: align,
      size: 'sm',
    };

    let content = '';
    if (this.props.menuItems.length) {
      content = this.props.menuItems.map(item => this.renderItem(item));
    }

    return (
      <DropdownMenu {...menuOptions}>
        {content}
      </DropdownMenu>
    );
  }
}

DropDown.defaultProps = {
  align: 'right',
  menuItems: [],
  onItemClick: () => false,
  toggle: '',
};

DropDown.propTypes = {
  align: PropTypes.string,
  menuItems: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    id: PropTypes.string,
    onClick: PropTypes.func,
    iconClass: PropTypes.string,
    items: PropTypes.array,
    disabled: PropTypes.bool,
  })),
  onItemClick: PropTypes.func,
  toggle: PropTypes.string,
};

export default DropDown;
