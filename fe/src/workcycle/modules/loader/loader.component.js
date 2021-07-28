import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

export class Loader extends Component {

  render() {
    const {loader} = this.props;

    if (!loader.show) {
      return false;
    }

    return (
      <div className="loader-container">
        <div className="center-block text-center loader">
          <div className="spinner" />
        </div>
      </div>
    );
  }
}

Loader.propTypes = {
  loader: PropTypes.object.isRequired,
};

export default connect((state) => ({
  loader: state.loader,
}))(Loader);
