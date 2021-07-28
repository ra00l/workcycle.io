/**
 * @namespace workitemRow.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

// components
import WorkitemTitle from './workItemTitle.component';

class WorkItemNavBar extends Component {

  render() {
    return (
      <div className="workitem-row">
        {this.renderTitleField()}
      </div>
    );
  }
}

WorkItemNavBar.defaultProps = {
  boardId: '',
  dispatch: () => false,
  isChild: false,
  workItem: {},
};

WorkItemNavBar.propTypes = {
  boardId: PropTypes.string,
  dispatch: PropTypes.func,
  isChild: PropTypes.bool,
  workItem: PropTypes.object.isRequired,
};

export default WorkItemNavBar;
