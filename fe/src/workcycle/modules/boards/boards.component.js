/**
 * @namespace boards.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

// services

// routes

// actions
import {getBoards} from './boards.actions';

// components
import BoardsList from './boards.list.component';
import BoardDetailed from '../boards/board.detailed.component';

/**
 * @private
 * @description Prefix for logging
 * @memberOf boards.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[boards.component]';

/**
 * Boards component
 *
 * @class Boards
 * @memberOf boards.component
 * @extends React.Component
 *
 * @example
 * <Boards />
 */
class Boards extends Component {

  /**
   * React lifecycle method - componentWillMount
   *
   * @instance
   * @memberOf boardDetailed.component.BoardDetailed
   * @method componentWillMount
   */
  componentWillMount() {
    const {
      company: {
        lastWorkspace,
      },
    } = this.props;

    this.props.dispatch(getBoards(lastWorkspace));
  }

  /**
   * Render method
   *
   * @instance
   * @memberOf boards.component.Boards
   * @method render
   *
   * @return {Object} JSX HTML Content
   */
  render() {
    const {
      boards,
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
        <BoardDetailed boardId={boardId} />
      );
    }

    return (
      <BoardsList />
    );
  }
}

Boards.propTypes = {
  boards: PropTypes.object.isRequired,
  children: PropTypes.node,
  company: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};

export default connect((state) => ({
  boards: state.boards,
  company: state.company,
}))(Boards);
