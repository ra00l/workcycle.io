import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// services
import l10nService from '../../../modules/l10n/l10n.service';

class InputField extends Component {

  /**
   * Returns the input field class string
   *
   * @instance
   * @memberOf inputField.component.InputField
   * @method getInputClassString
   *
   * @return {String} input field class
   */
  getInputClassString() {
    const {
      meta: {
        touched,
        error,
      },
    } = this.props;

    return classnames('form-group', {
      'form-group--error': touched && error,
    });
  }

  /**
   * Render field label
   *
   * @instance
   * @memberOf inputField.component.InputField
   * @method renderFieldLabel
   *
   * @return {Object | Boolean} JSX HTML Content | false
   */
  renderFieldLabel() {
    const {
      input,
      label,
    } = this.props;

    if (label) {
      return (
        <label className="control-label" htmlFor={input.name}>
          {l10nService.translate(label)}
        </label>
      );
    }

    return false;
  }

  /**
   * Render field
   *
   * @instance
   * @memberOf inputField.component.InputField
   * @method renderField
   *
   * @return {Object} JSX HTML Content
   */
  renderField() {
    const {
      input,
      placeholder,
      type,
      disabled,
    } = this.props;

    const disabledField = disabled ? 'disabled' : '';

    return (
      <input
        {...input}
        id={input.name}
        className="form-control"
        placeholder={l10nService.translate(placeholder)}
        type={type}
        autoComplete="off"
        disabled={disabledField}
      />
    );
  }

  /**
   * Render field error
   *
   * @instance
   * @memberOf inputField.component.InputField
   * @method renderFieldError
   *
   * @return {Object | Boolean} JSX HTML Content | false
   */
  renderFieldError() {
    const {
      meta: {
        touched,
        error,
      },
    } = this.props;

    if (touched && error) {
      return (
        <span className="error">{error}</span>
      );
    }

    return false;
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf inputField.component.InputField
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    return (
      <div className={this.getInputClassString()}>
        {/* render label */}
        {this.renderFieldLabel()}

        {/* render input field */}
        {this.renderField()}

        {/* render error */}
        {this.renderFieldError()}
      </div>
    );
  }
}

InputField.defaultProps = {
  label: '',
  disabled: false,
};

InputField.propTypes = {
  input: PropTypes.object,
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.object,
  disabled: PropTypes.bool,
};

export default InputField;
