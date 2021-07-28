import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// services
import l10nService from './../../../modules/l10n/l10n.service';

// components
import Select from 'react-select';

class SelectField extends Component {

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
   * onChange handler for selecting new value from select
   *
   * @instance
   * @memberOf inputField.component.InputField
   * @method onChange
   *
   * @param {Object} selectedValue - the new selected value
   */
  onChange = (selectedValue) => {
    let value = null;

    if (selectedValue && selectedValue.value) {
      value = selectedValue.value;
    }

    this.props.onChangeHandler(value);
  }

  /**
   * Render field label
   *
   * @instance
   * @memberOf inputField.component.InputField
   * @method renderFieldLabel
   *
   * @return {Object} JSX HTML Content
   */
  renderFieldLabel() {
    const {
      label,
    } = this.props;

    if (label) {
      return (
        <label className="description-field-label">
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
      options,
      clearable,
      selectedValue,
      searchable,
      placeholder,
      isLoading,
    } = this.props;
    const showCleable = clearable ? selectedValue !== '' : clearable;

    return (
      <Select
        name="form-field-name"
        value={selectedValue}
        clearable={showCleable}
        options={options}
        onChange={this.onChange}
        searchable={searchable}
        placeholder={placeholder}
        isLoading={isLoading}
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

SelectField.defaultProps = {
  searchable: false,
  isLoading: false,
  meta: {},
};

SelectField.propTypes = {
  clearable: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.object,
  options: PropTypes.array.isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  selectedValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  searchable: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SelectField;
