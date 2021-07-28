import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NumberFieldExtraInformationModal
  from './../../../../components/numberFieldExtraInfoModal/numberFieldExtaInfoModal.component';

import {updateField} from './../../../fields/fields.actions';

class FieldExtraInformation extends Component {

  state = {
    openMenu: false,
    unit: null,
  };

  getUnit() {
    const {field} = this.props;

    const unit = field.getIn(['meta', 'unit']);

    if (unit && unit !== 'None' && unit !== '') {
      return unit;
    }

    return null;
  }

  getFunction() {
    const {field} = this.props;

    const fnc = field.getIn(['meta', 'functionToUse']);

    if (fnc && fnc !== 'None') {
      return fnc;
    }

    return null;
  }

  getConsiderChildren() {
    const {field} = this.props;

    const considerChildren = field.getIn(['meta', 'considerChildren']);

    if (considerChildren && considerChildren !== null) {
      return considerChildren;
    }

    return false;
  }

  getValueAndNumberOfItems(items = []) {
    const {
      field,
      workItems,
    } = this.props;
    const considerChildren = this.getConsiderChildren();
    let itemsValues = [];

    items.map(itemId => {
      const workItem = workItems.get(`${itemId}`) || Map();
      const valueFromWorkItem = workItem.get(`${field.get('id')}`) || null;

      itemsValues.push(parseFloat(valueFromWorkItem));

      if (considerChildren) {
        itemsValues = [...itemsValues, ...this.getValueAndNumberOfItems(workItem.get('items'))];
      }
    });

    return itemsValues;
  }

  calculateSum() {
    const {itemIds} = this.props;
    let sum = 0;
    const values = this.getValueAndNumberOfItems(itemIds);

    values.forEach(value => {
      if (value) {
        sum += parseFloat(value);
      }
    });

    return sum;
  }

  calculateAvg() {
    const {itemIds} = this.props;
    const sum = this.calculateSum();
    const items = this.getValueAndNumberOfItems(itemIds);
    let avg = 0;

    if (items.length > 0) {
      avg = sum / items.length;
    }

    return avg;
  }

  calculateMed() {
    const {itemIds} = this.props;
    const items = this.getValueAndNumberOfItems(itemIds);
    let values = [];

    items.forEach(item => {
      if (item) {
        values.push(item);
      }
    });

    values = values.sort();

    if (values.length) {
      if (values.length % 2 === 0) { // array with even number elements
        return (values[values.length / 2] + values[(values.length / 2) - 1]) / 2;
      }
      
      return values[(values.length - 1) / 2]; // array with odd number elements
    }

    return 0;
  }

  calculateMin() {
    const {itemIds} = this.props;
    const items = this.getValueAndNumberOfItems(itemIds);
    const values = [];

    items.forEach(item => {
      if (item) {
        values.push(item);
      }
    });

    if (values.length) {
      return Math.min(...values);
    }

    return 0;
  }

  calculateMax() {
    const {itemIds} = this.props;
    const items = this.getValueAndNumberOfItems(itemIds);
    const values = [];

    items.forEach(item => {
      if (item) {
        values.push(item);
      }
    });

    if (values.length) {
      return Math.max(...values);
    }

    return 0;
  }

  calculateValue() {
    const fnc = this.getFunction();
    let valueToDisplay = 0;

    switch (fnc) {
      case 'SUM':
        valueToDisplay = this.calculateSum();
        break;
      case 'AVG':
        valueToDisplay = this.calculateAvg();
        break;
      case 'MED':
        valueToDisplay = this.calculateMed();
        break;
      case 'MIN':
        valueToDisplay = this.calculateMin();
        break;
      case 'MAX':
        valueToDisplay = this.calculateMax();
        break;
    }

    valueToDisplay = valueToDisplay.toFixed(2);
    valueToDisplay = Math.round(valueToDisplay * 100) / 100;

    return valueToDisplay;
  }

  handleOnClickOnContainer = () => {
    this.setState({
      openMenu: true,
    });
  }

  handleOnRequestChange = (value) => {
    const unit = this.getUnit();

    this.setState({
      openMenu: false,
    });

    if (this.state.unit && unit !== this.state.unit) {
      this.changeFieldMeta({
        unit: this.state.unit,
      });
    }
  }

  handleUnitChange = (unit) => {
    this.setState({
      unit,
    });

    this.changeFieldMeta({
      unit,
      considerChildren: this.getConsiderChildren(),
    });
  }

  handleFunctionChange = (fnc) => {
    this.changeFieldMeta({
      functionToUse: fnc,
      considerChildren: this.getConsiderChildren(),
    });
  }
  
  handleConsiderChildrenChange = (considerChildren) => {
    this.changeFieldMeta({
      considerChildren,
    });
  }

  handleOnChangeOnCustomUnitField = (value) => {
    this.setState({
      unit: value,
    });
  }

  changeFieldMeta(meta) {
    const {
      boardId,
      dispatch,
      field,
      workspaceId,
    } = this.props;

    const fieldMeta = field.get('meta') || Map();

    const newField = {
      ...field.toJS(),
      meta: {
        ...fieldMeta.toJS(),
        ...meta,
      },
    };

    dispatch(updateField(workspaceId, boardId, field.get('id'), newField));
  }

  renderValue(fieldValue) {
    const unit = this.getUnit();
    const valueToDisplay = this.calculateValue();

    return (
      <span>{valueToDisplay} {unit}</span>
    );
  }

  renderModal() {
    const unit = this.getUnit();
    const functionToUse = this.getFunction();
    const considerChildren = this.getConsiderChildren();

    return (
      <IconMenu
        iconButtonElement={<IconButton style={{width: '1px', height: '1px', padding: 0}}/>}
        open={this.state.openMenu}
        onRequestChange={this.handleOnRequestChange}
        clickCloseDelay={0}
        targetOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        menuStyle={{
          width: '260px',
          padding: 0,
        }}
        listStyle={{
          padding: 0,
        }}
        menuItemStyle={{
          padding: 0,
        }}
        style={{
          padding: 0,
        }}
      >
        <NumberFieldExtraInformationModal
          fieldUnit={unit}
          fieldFunction={functionToUse}
          considerChildren={considerChildren}
          onUnitChange={this.handleUnitChange}
          onFunctionChange={this.handleFunctionChange}
          onConsiderChildrenChange={this.handleConsiderChildrenChange}
          onChangeCustomUnitField={this.handleOnChangeOnCustomUnitField}
        />
      </IconMenu>
    );
  }

  render() {
    return (
      <div onClick={this.handleOnClickOnContainer}>
        {this.renderModal()}
        {this.renderValue()}
      </div>
    );
  }
}

FieldExtraInformation.defaultProps = {};

FieldExtraInformation.propTypes = {
  boardId: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  field: PropTypes.object.isRequired,
  itemIds: PropTypes.object.isRequired,
  workItems: PropTypes.object.isRequired,
  workspaceId: PropTypes.number.isRequired,
};

export default connect((state, props) => {
  const nestsStore = state.nests;
  const workItemsStore = state.workItems;

  const itemIds = nestsStore.getIn(['data', `${props.nestId}`, 'sortedWorkItems']) || Map();
  const workItems = workItemsStore.get('data');

  return {
    itemIds,
    workItems,
  };
})(FieldExtraInformation);
