import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// services
import l10nService from './../../../modules/l10n/l10n.service';

class GeneralFormError extends Component {

  /**
   * Returns the error container class string
   *
   * @instance
   * @memberOf generalError.component.GeneralFormError
   * @method getContainerClassString
   *
   * @return {String} input field class
   */
  getContainerClassString() {

    return classnames('error-message');
  }

  /**
   * Render field error
   *
   * @instance
   * @memberOf generalError.component.GeneralFormError
   * @method getErrors
   *
   * @return {Array<Object>} Array of JSX Markup
   */
  getErrors() {
    const {errors} = this.props;

    const errorsMarkup = errors.map((errorItem, index) => {
      const errorIndex = `ERROR_${index}`;

      return (
        <div key={errorIndex}>
          {l10nService.translate(`API_ERRORS.${errorItem.code}`)}
        </div>
      );
    });

    return errorsMarkup;
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf generalError.component.GeneralFormError
   * @method render
   *
   * @return {Object |  Boolean} JSX HTML Content | false
   */
  render() {
    const {errors} = this.props;

    if (errors.length) {
      const errors = this.getErrors();

      return (
        <div className={this.getContainerClassString()}>
          {errors}
        </div>
      );
    }

    return false;
  }
}

GeneralFormError.defaultProps = {
  errors: [],
};

GeneralFormError.propTypes = {
  errors: PropTypes.array,
};

export default GeneralFormError;
