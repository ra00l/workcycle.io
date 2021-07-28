import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Map} from 'immutable';

// // services
import workItemService from './workItem.service';

// // actions
import {dismissDialog} from './../../dialog/dialog.actions';

import {cloneWorkItem} from '../workItems.actions';

// components
import Button from './../../../components/button/button.component';
import SelectField from './../../../components/form/selectField/selectField.component';

class WorkItemClone extends Component {

  state = {
    selectedNest: parseInt(this.props.nestId, 10),
    nests: [],
    isNestsLoading: false,
  };

  handleSubmitCloneWorkItem = () => {
    const {
      selectedNest,
    } = this.state;

    const {
      boardId,
      dispatch,
      workItem,
    } = this.props;

    dispatch(cloneWorkItem(boardId, workItem.toJS(), selectedNest));

    dispatch(dismissDialog());
  };

  getNestIdOptions() {
    const arr = [];
    const {
      nests,
    } = this.props;

    nests.map(nest => {
      arr.push({
        label: nest.get('name'),
        value: parseInt(nest.get('id'), 10),
      });
    });

    return arr;
  }

  setNest = (nestId) => {
    this.setState({
      selectedNest: parseInt(nestId, 10),
    });
  };

  renderTitle() {
    return (
      <div className="board-header">
        <h3 className="text--bold">Clone workitem</h3>
      </div>
    );
  }

  renderNestSelector() {
    const nestssIdOptions = this.getNestIdOptions();

    return (
      <SelectField
        clearable={false}
        options={nestssIdOptions}
        label="FORM.LABEL.NEST"
        placeholder="Please select an nest"
        onChangeHandler={this.setNest}
        selectedValue={this.state.selectedNest}
        searchable={true}
        isLoading={this.state.isNestsLoading}
      />);
  }

  renderFormButtons() {
    const enabled = this.state.selectedNest !== '';

    return (
      <div className="board-form-actions row">
        <div className="col-xs-12 text-center">
          <Button
            label="Clone"
            type="primary"
            disabled={!enabled}
            onClick={this.handleSubmitCloneWorkItem}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderNestSelector()}
        {this.renderFormButtons()}
      </div>
    );
  }
}

WorkItemClone.defaultProps = {};

WorkItemClone.propTypes = {
  nests: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  nestId: PropTypes.number.isRequired,
  boardId: PropTypes.number.isRequired,
  workItem: PropTypes.object.isRequired,
};

const WorkItemCloneCb = connect((state, props) => {
  const nestsStore = state.nests;

  const nests = nestsStore.get('data') || Map();

  return {
    nests,
  };
})(WorkItemClone);

export default WorkItemCloneCb;
