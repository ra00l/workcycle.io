import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

// actions
import {getGoals} from './goals.actions';

// components
import GoalsList from './goals.list.component';

class GoalsLandingPage extends Component {

  componentWillMount() {
    const {
      company: {
        lastWorkspace,
      },
    } = this.props;

    this.props.dispatch(getGoals(lastWorkspace));
  }

  render() {
    const {
      children,
      params: {
        goalId,
      },
    } = this.props;

    // we are on a child page
    if (goalId) {
      return (
        <div>
          {children}
        </div>
      );
    }

    return (
      <GoalsList />
    );
  }
}

GoalsLandingPage.propTypes = {
  children: PropTypes.node,
  company: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

export default connect((state) => ({
  company: state.company,
}))(GoalsLandingPage);
