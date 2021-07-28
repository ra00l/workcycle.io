import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const supportedButtonTypes = ['primary', 'secondary', 'link'];

class Button extends Component {

  /**
   * Returns the correct css class for icon
   *
   * @memberOf components.button.Button
   * @method getIconClass
   *
   * @param {String} icon - CM icon like lobby-phone, role, mic, etc.
   * @return {String} css class
   */
  getIconClass(icon) {
    return classNames('fa', {
      [`fa-${icon}`]: icon,
      'margin-right-8': this.props.label,
    });
  }

  /**
   * Returns the correct css class the button
   *
   * @memberOf components.button.Button
   * @method getButtonClass
   *
   * @param {String} buttonType - the type of the button (see propTypes)
   * @return {String} css class
   */
  getButtonClass(buttonType) {
    let useButtonType = supportedButtonTypes[0];
    const {
      icon,
      label,
    } = this.props;
    if (supportedButtonTypes.indexOf(buttonType) !== -1) {
      useButtonType = buttonType;
    }

    return classNames({
      'button': true,
      [`button--${useButtonType}`]: useButtonType,
      'button--with-icon': !label && icon,
    });
  }

  /**
   * Returns the button type
   *
   * @memberOf components.button.Button
   * @method getButtonType
   * @instance
   *
   * @param {Boolean} isSubmitType - flag that indicates if a button is used for submiting a form
   * @return {String} css class
   */
  getButtonType() {
    return this.props.shouldSubmitForm ? 'submit' : 'button';
  }

  /**
   * Handle Click on button
   *
   * @memberOf components.button.Button
   * @method handleClick
   *
   * @param {Array} args - Arguments list
   */
  handleClick = (...args) => {
    const {
      onClick,
    } = this.props;

    if (typeof onClick === 'function') {
      onClick(...args);
    }
  };

  /**
   * Render Icon inside button
   *
   * @memberOf components.button.Button
   * @method renderIcon
   *
   * @param {String} icon - icon
   * @return {JSX|Boolean} HTML Content | false
   */
  renderIcon(icon) {
    if (icon) {
      return (
        <span className={this.getIconClass(icon)} />
      );
    }

    return false;
  }

  /**
   * Render
   *
   * @memberOf components.button.Button
   * @method render
   *
   * @return {JSX} HTML Content
   */
  render() {
    const {
      disabled,
      icon,
      label,
      type,
    } = this.props;

    return (
      <button
        type={this.getButtonType()}
        onClick={this.handleClick}
        className={this.getButtonClass(type)}
        disabled={disabled ? 'disabled' : ''}
      >
        {this.renderIcon(icon)}
        {label}
      </button>
    );
  }
}

Button.defaultProps = {
  disabled: false,
  icon: '',
  fullWidth: false,
  label: '',
  onClick: () => false,
  shouldSubmitForm: false,
};

Button.propTypes = {
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  fullWidth: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  shouldSubmitForm: PropTypes.bool,
  type: PropTypes.string,
};

export default Button;
