import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Slider from 'react-rangeslider';

class PercentageField extends Component {
  state = {
    value: this.props.value,
  }

  handleChange = (value) => {
    // update the value
    this.setState({
      value: value,
    });
  };

  handleChangeComplete = () => {
    // call the parent when the value
    this.props.onChange(this.state.value);
  };

  render() {
    const {value} = this.state;

    const classString = classnames('percentage-field slider', {
      'completed': value === 100,
    });

    return (
      <div className={classString}>
        <div className="percentage-field-info">
          <h4>Completion</h4>
          <div className="value">{value}%</div>
        </div>

        <Slider
          min={0}
          max={100}
          value={value}
          onChange={this.handleChange}
          onChangeComplete={this.handleChangeComplete}
        />
      </div>
    );
  }
}

PercentageField.defaultProps = {};

PercentageField.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
};

export default PercentageField;
