import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Toggle from 'material-ui/Toggle';

const FUNCTIONS_BUTTON = ['None', 'SUM', 'AVG', 'MED', 'MIN', 'MAX'];
const UNIT_BUTTONS = ['None', '$', '€', 'pt', '%'];

class NumberFieldExtraInfoModal extends Component {

  state = {
    unit: this.props.fieldUnit,
    fnc: this.props.fieldFunction,
    considerChildren: this.props.considerChildren,
    customUnitValue: '',
  };

  componentWillMount() {
    const {fieldUnit} = this.props;
  
    if (UNIT_BUTTONS.indexOf(fieldUnit) === -1 && fieldUnit !== '' && fieldUnit) {
      this.setState({
        customUnitValue: fieldUnit,
      });
    }
  }

  handleOnChangeOnCustomUnitInputField = (evt) => {
    const {
      target: {
        value,
      },
    } = evt;

    this.setState({
      customUnitValue: value,
    });

    this.props.onChangeCustomUnitField(value);
  }

  handleBlurOnCustomUnitInputField = () => {
    this.props.onUnitChange(this.state.customUnitValue);
  }

  handlerForChildItems = (evt, isInputChecked) => {
    this.props.onConsiderChildrenChange(isInputChecked);
  };

  handleClickOnUnit(newUnit) {
    this.setState({
      unit: newUnit,
    });

    this.props.onUnitChange(newUnit);
  }

  handleClickOnFunction(newFunction) {
    this.setState({
      fnc: newFunction,
    });

    this.props.onFunctionChange(newFunction);
  }

  renderFunctions() {
    const {fnc} = this.state;

    const buttonsMarkup = FUNCTIONS_BUTTON.map((button, index) => {
      const classString = classnames('button button--small button--border', {
        'button--border-selected': ((!fnc && button === 'None') || (button === fnc)),
      });

      return (
        <button
          key={index}
          className={classString}
          onClick={() => this.handleClickOnFunction(button)}
        >
          {button}
        </button>
      );
    });

    return (
      <div>{buttonsMarkup}</div>
    );
  }

  renderUnit() {
    const {unit} = this.state;

    const buttonsMarkup = UNIT_BUTTONS.map((button, index) => {
      const classString = classnames('button button--small button--border', {
        'button--border-selected': ((!unit && button === 'None') || (button === unit)),
      });

      return (
        <button
          key={index}
          className={classString}
          onClick={() => this.handleClickOnUnit(button)}
        >
          {button}
        </button>
      );
    });

    return (
      <div>{buttonsMarkup}</div>
    );
  }

  render() {
    const classString = classnames('number-field-extra-info');

    return (
      <div className={classString}>
        <div className="number-field-extra-info-section">
          <h4>Unit</h4>
          <div className="number-field-extra-info-section-body">
            {this.renderUnit()}
            <input
              type="text"
              placeholder="type your own unit"
              className="form-control custom-input"
              value={this.state.customUnitValue}
              onChange={this.handleOnChangeOnCustomUnitInputField}
              onBlur={this.handleBlurOnCustomUnitInputField}
            />
          </div>
        </div>

        <div className="number-field-extra-info-section">
          <h4>Function</h4>
          <div className="number-field-extra-info-section-body">
            {this.renderFunctions()}
            {/* <input type="text" placeholder="type your own" /> */}
          </div>
        </div>

        <div className="number-field-extra-info-section">
          <h4>Children</h4>
          <div className="number-field-extra-info-section-body">
            <Toggle
              label="Take into consideration child items"
              labelPosition="right"
              toggled={this.props.considerChildren}
              onToggle={this.handlerForChildItems}
            />
          </div>
        </div>
      </div>
    );
  }
}

NumberFieldExtraInfoModal.defaultProps = {
  fieldUnit: '',
  fieldFunction: '',
  considerChildren: false,
};

NumberFieldExtraInfoModal.propTypes = {
  onUnitChange: PropTypes.func.isRequired,
  onFunctionChange: PropTypes.func.isRequired,
  onConsiderChildrenChange: PropTypes.func.isRequired,
  onChangeCustomUnitField: PropTypes.func.isRequired,
  fieldUnit: PropTypes.string,
  fieldFunction: PropTypes.string,
  considerChildren: PropTypes.bool,
};

export default NumberFieldExtraInfoModal;
