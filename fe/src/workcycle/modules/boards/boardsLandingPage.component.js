import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

// actions
import {getBoards} from './boards.actions';
import {invalidateGoals} from './../goals/goals.actions';

// components
import BoardsList from './boards.list.component';

class BoardsLandingPage extends Component {

  componentWillMount() {
    const {
      company: {
        lastWorkspace,
      },
    } = this.props;

    this.props.dispatch(getBoards(lastWorkspace));
    this.props.dispatch(invalidateGoals());
  }

  render() {
    const {
      company: {
        lastWorkspace,
      },
      dispatch,
      params: {
        boardId,
      },
    } = this.props;

    // we are on a child page
    if (boardId) {
      return (
        <div>
          {this.props.children}
        </div>
      );
    }

    return (
      <BoardsList />
    );
  }
}

BoardsLandingPage.propTypes = {
  children: PropTypes.node,
  company: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

export default connect((state) => ({
  company: state.company,
}))(BoardsLandingPage);
