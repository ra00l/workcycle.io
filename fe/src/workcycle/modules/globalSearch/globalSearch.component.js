import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {browserHistory} from 'react-router';

// actions
import {dismissDialog} from '../dialog/dialog.actions';

import globalSearchService from './globalSearch.service';

// components
import browserUtilService from '../../services/browser.util.service';
import Checkbox from 'material-ui/Checkbox';

class GlobalSearch extends Component {

  state = {
    query: '',
    results: null,
    error: false,
    all: true,
    onlyBoards: false,
    onlyNests: false,
    onlyItems: false,
  }

  generateQueryObject(inputText) {
    const {
      all,
      onlyBoards,
      onlyNests,
      onlyItems,
    } = this.state;

    const query = {
      board: null,
      nest: null,
      item: null,
      global: null,
    };

    if (all) {
      query.global = inputText;
    }
    if (onlyBoards) {
      query.board = inputText;
    }
    if (onlyNests) {
      query.nest = inputText;
    }
    if (onlyItems) {
      query.item = inputText;
    }

    return query;
  }

  handleOnChange = (evt) => {
    this.setState({
      query: evt.target.value,
      error: false,
    });

    if (evt.target.value !== '') {
      // TODO: update board id to be general, global search not filtered on a specific board
      this.callSearchApi(evt.target.value);
    } else {
      this.setState({
        results: null,
      });
    }
  }

  callSearchApi(searchString) {
    const {
      workspaceId,
    } = this.props;

    const query = this.generateQueryObject(searchString);

    globalSearchService.search(workspaceId, '63', query)
      .then(response => {
        this.setState({
          results: response,
        });
      })
      .catch(err => {
        this.setState({
          error: true,
        });
      });
  }

  openWorkItem(item) {
    const {
      id,
      idBoard,
    } = item;
    const {workspaceId} = this.props;

    browserHistory.push(`/${workspaceId}/boards/${idBoard}/item/${id}`);
  }

  openNest(item) {
    const {
      idBoard,
      idNest,
    } = item;
    const {workspaceId} = this.props;

    browserHistory.push(`/${workspaceId}/boards/${idBoard}#nest-${idNest}`);

    browserUtilService.scrollToHash();

    this.props.dispatch(dismissDialog());
  }

  openBoard(item) {
    const {
      id,
      idBoard,
    } = item;
    const {workspaceId} = this.props;

    browserHistory.push(`/${workspaceId}/boards/${idBoard}`);

    this.props.dispatch(dismissDialog());
  }

  updateState(newState) {
    if (newState && !newState.onlyBoards && !newState.onlyNests && !newState.onlyItems) {
      this.setState({
        ...this.state,
        ...newState,
        all: true,
      }, () => {
        this.callSearchApi(this.state.query);
      });
    } else {
      this.setState({
        ...this.state,
        ...newState,
      }, () => {
        this.callSearchApi(this.state.query);
      });
    }
  }

  updateCheckAll = () => {
    const {all} = this.state;

    if (!all) {
      this.updateState({
        all: true,
        onlyBoards: false,
        onlyNests: false,
        onlyItems: false,
      });
    }
  }

  updateCheckBoards = () => {
    const {
      onlyBoards,
      onlyNests,
      onlyItems,
    } = this.state;

    if (onlyBoards) {
      this.updateState({
        onlyBoards: false,
        onlyNests,
        onlyItems,
      });
    } else {
      this.updateState({
        onlyBoards: true,
        all: false,
        onlyNests,
        onlyItems,
      });
    }
  }

  updateCheckNests = () => {
    const {
      onlyBoards,
      onlyNests,
      onlyItems,
    } = this.state;

    if (onlyNests) {
      this.updateState({
        onlyNests: false,
        onlyBoards,
        onlyItems,
      });
    } else {
      this.updateState({
        onlyNests: true,
        all: false,
        onlyBoards,
        onlyItems,
      });
    }
  }

  updateCheckItems = () => {
    const {
      onlyBoards,
      onlyNests,
      onlyItems,
    } = this.state;

    if (onlyItems) {
      this.updateState({
        onlyItems: false,
        onlyBoards,
        onlyNests,
      });
    } else {
      this.updateState({
        onlyItems: true,
        all: false,
        onlyBoards,
        onlyNests,
      });
    }
  }

  renderTitle() {
    const styles = {
      block: {
        maxWidth: 250,
      },
      checkbox: {
        marginBottom: 16,
      },
    };

    return (
      <div className="global-search-modal__title">
        <h4>Search</h4>
        <div className="text-center sub-title">
          <h5>Narrow your search:</h5>
          <ul>
            <li>
              <Checkbox
                label="All"
                checked={this.state.all}
                onCheck={this.updateCheckAll}
                style={styles.checkbox}
              />
            </li>
            <li>
              <Checkbox
                label="Boards"
                checked={this.state.onlyBoards}
                onCheck={this.updateCheckBoards}
                style={styles.checkbox}
              />
            </li>
            <li>
              <Checkbox
                label="Nests"
                checked={this.state.onlyNests}
                onCheck={this.updateCheckNests}
                style={styles.checkbox}
              />
            </li>
            <li>
              <Checkbox
                label="Items"
                checked={this.state.onlyItems}
                onCheck={this.updateCheckItems}
                style={styles.checkbox}
              />
            </li>
          </ul>
        </div>
      </div>
    );
  }

  renderInput() {
    return (
      <div className="form-group">
        <input
          type="text"
          className="form-control"
          value={this.state.query}
          onChange={this.handleOnChange}
          placeholder="search for .."
          autoFocus
        />
      </div>
    );
  }

  renderSearchResults() {
    const {
      error,
      results,
    } = this.state;

    if (error) {
      return (
        <div>There was an error with your search!</div>
      );
    }

    if (!results) {
      return false;
    }

    if (results.length === 0) {
      return (
        <div>There are no results for your query</div>
      );
    }

    return this.renderResults();
  }

  renderResults() {
    const {results} = this.state;

    const itemsMarkup = results.map((item, index) => {
      const key = `KEY_${item.id}_${item.idNest}_${item.idBoard}`;

      let itemMarkup = (<div>
        <a className="board" onClick={() => this.openBoard(item)}>{item.boardName}</a>
        <span> / </span>
        <a className="nest" onClick={() => this.openNest(item)}>{item.nestName}</a>
        <span> / </span>
        <a className="workItem" onClick={() => this.openWorkItem(item)}>{item.title}</a>
      </div>);

      if (!item.title && !item.nestName) {
        itemMarkup = (<div>
          <a className="board" onClick={() => this.openBoard(item)}>{item.boardName}</a>
        </div>);
      } else if (!item.title) {
        itemMarkup = (<div>
          <a className="board" onClick={() => this.openBoard(item)}>{item.boardName}</a>
          <span> / </span>
          <a className="nest" onClick={() => this.openNest(item)}>{item.nestName}</a>
        </div>);
      }

      return (
        <li
          key={key}
          className="global-search__results__item"
        >
          {itemMarkup}
        </li>
      );
    });

    return (
      <div>
        <span className="no-of-results">Results: {results.length} items</span>
        <ul className="global-search__results">{itemsMarkup}</ul>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderTitle()}
        {this.renderInput()}
        {this.renderSearchResults()}
      </div>
    );
  }
}

GlobalSearch.defaultProps = {};

GlobalSearch.propTypes = {
  dispatch: PropTypes.func.isRequired,
  workspaceId: PropTypes.number,
};

export default GlobalSearch;
