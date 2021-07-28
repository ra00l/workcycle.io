/**
 * @namespace dashboard.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router';

// actions
import {
  showLoader,
  hideLoader,
} from '../loader/loader.actions';
import {getBoards} from '../boards/boards.actions';
import {getGoals} from '../goals/goals.actions';

// components
import BoardsList from '../boards/boards.list.component';
import GoalsListWidget from '../goals/goals.list.widget.component';

/**
 * @private
 * @description Prefix for logging
 * @memberOf dashboard.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[dashboard.component]';

/**
 * Dashboard component, rendered when you access the root
 *
 * @memberOf dashboard.component
 * @class Dashboard
 * @extends React.Component
 *
 * @example
 * <Dashboard />
 */
class Dashboard extends Component {

  /**
   * Component insternal state
   *
   * @memberOf dashboard.component.Dashboard
   * @const {String}
   * @default
   */
  state = {
    areDependenciesReady: false,
  };

  /**
   * React lifecycle method - componentWillMount
   *
   * @instance
   * @memberOf dashboard.component.Dashboard
   * @method componentWillMount
   */
  componentWillMount() {
    const {
      boards,
      company: {
        lastWorkspace,
      },
      goals,
      dispatch,
    } = this.props;

    // if we do not have data already
    if (!boards.data || goals.data) {
      dispatch(showLoader());
      dispatch(getBoards(lastWorkspace));
      dispatch(getGoals(lastWorkspace));
    } else {
      this.checkDependencies(this.props);
    }
  }

  /**
   * React lifecycle method - componentWillReceiveProps
   *
   * @instance
   * @memberOf dashboard.component.Dashboard
   * @method componentWillReceiveProps
   *
   * @param {Object} nextProps - the new properties received by the component
   */
  componentWillReceiveProps(nextProps) {
    // check for dependencies
    this.checkDependencies(nextProps);
  }

  /**
   * check to see if all the dependencies are fetched
   *
   * @instance
   * @memberOf dashboard.component.Dashboard
   * @method checkDependencies
   *
   * @param {Object} props - component properties
   */
  checkDependencies(props) {
    const {
      dashboard,
      dispatch,
    } = props;
    let isFetching = true;

    if (!dashboard.boardsActionInProgress) {
      isFetching = false;
      dispatch(hideLoader());
    }

    this.setState({
      areDependenciesReady: !isFetching,
    });
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf dashboard.component.Dashboard
   * @method render
   *
   * @return {Object | Boolean} JSX HTML Content | false
   */
  render() {
    const {
      boards,
      dispatch,
      company: {
        lastWorkspace,
      },
    } = this.props;

    if (this.state.areDependenciesReady) {
      return (
        <div className="dashboard-container">
          <BoardsList />
          <GoalsListWidget />
        </div>
      );
    }

    return false;
  }
}

Dashboard.propTypes = {
  boards: PropTypes.object,
  children: PropTypes.node,
  company: PropTypes.object,
  dashboard: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  goals: PropTypes.object,
};

export default connect((state) => ({
  boards: state.boards,
  dashboard: state.dashboard,
  company: state.company,
  goals: state.goals,
}))(Dashboard);
