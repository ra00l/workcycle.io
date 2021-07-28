/**
 * @namespace header.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {Link, browserHistory} from 'react-router';
import Avatar from 'material-ui/Avatar';
import {connect} from 'react-redux';

// actions
import {invalidateCompanyData} from '../../modules/company/company.actions';
import {invalidateAuth} from '../../modules/auth/auth.actions';
import {showDialog} from './../../modules/dialog/dialog.actions';

// components
import Navigation from '../../modules/navigation/navigation.component';
import Workspace from '../../modules/workspace/workspace.component';
import WorkspaceMembers from '../../modules/workspace/workspace.members.component';
import NestModal from '../../modules/nests/nestModal.component';
import WorkItemModal from '../../modules/workItems/workItem/modal/workItemModal.component';
import {renderUserIcon} from '../../modules/users/user.helper';
import ROLE from '../../contants/role.constants';
import LoginAs from '../../modules/auth/loginas.component';


// material ui component
import GlobalSearch from './../../modules/globalSearch/globalSearch.component';
import {COLOR_ARRAY} from '../../contants/colors.constants';

import MenuItem from 'material-ui/MenuItem';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';

import Board from './../../modules/boards/board/boardModal.component';
import CreateBoard from './../../modules/boards/board/createBoardModal.component';
import CreateGoal from './../../modules/goals/goal/createGoalModal.component';
import Folder from './../../modules/folders/folderModal.component';

class Header extends Component {

  state = {
    isNavOpened: false,
    isUserInfoOpened: false,
    userInfoRef: null,
    isAddMenuOpened: false,
    addMenuRef: null,
  };

  getContainerClassString() {
    const defaultClass = 'header flex-center-space-between';

    return classnames(defaultClass, {
      'not-logged-in': !this.props.isUserLoggedIn,
    });
  }

  getHamburgerMenuClassString() {
    return classnames('fas', {
      'fa-bars': !this.state.isNavOpened,
      'fa-times': this.state.isNavOpened,
    });
  }

  handleClickOnHamburgerMenu = () => {
    this.setState({
      isNavOpened: !this.state.isNavOpened,
    });
  };

  displaySearch = () => {
    const {
      dispatch,
      company: {
        lastWorkspace,
      },
    } = this.props;

    const options = {
      closeCb: () => false,
      content: (
        <GlobalSearch
          dispatch={dispatch}
          workspaceId={lastWorkspace}
        />
      ),
      className: 'global-search-modal',
    };
    const buttons = [];

    dispatch(showDialog(options, buttons));
  };

  renderHamburgerIcon() {
    if (this.props.isUserLoggedIn) {
      return (
        <div className="header-menu" onClick={this.handleClickOnHamburgerMenu}>
          <i className={this.getHamburgerMenuClassString()} />
        </div>
      );
    }

    return false;
  }

  renderLogo() {
    return (<h2 className="header-title">
      <img id="workcycle-logo" src="/assets/images/logo.png" alt="workcycle logo" />
    </h2>);
  }

  renderTitle() {
    const {
      company: {
        lastWorkspace,
      },
    } = this.props;
    let header = this.renderLogo();

    if (this.props.isUserLoggedIn) {
      header = (
        <Link to={`/${lastWorkspace}`} className="logo-container">
          {header}
        </Link>
      );
    }

    return header;
  }

  renderSearch() {
    if (this.props.isUserLoggedIn) {
      return (
        <div className="form-group search-container" onClick={this.displaySearch}>
          <i className="fas fa-search" />
          <input
            className="form-control"
            onFocus={this.handleFocusOnSearch}
          />
        </div>
      );
    }

    return false;
  }

  handleAddChange(proxy, value) {
    if (value === 'b') {
      const options = {
        closeCb: () => false,
        content: (
          <CreateBoard />
        ),
        className: 'create-board-modal-container',
      };
      const buttons = [];

      this.props.dispatch(showDialog(options, buttons));
    } else if (value === 'w') {
      const options = {
        closeCb: () => false,
        content: (
          <Workspace />
        ),
      };
      const buttons = [];

      this.props.dispatch(showDialog(options, buttons));
    } else if (value === 'n') {
      const options = {
        closeCb: () => false,
        content: (
          <NestModal />
        ),
      };
      const buttons = [];

      this.props.dispatch(showDialog(options, buttons));
    } else if (value === 'bf' || value === 'gf') {
      const options = {
        closeCb: () => false,
        content: (
          <Folder type={value === 'bf' ? 0 : 1} />
        ),
      };
      const buttons = [];

      this.props.dispatch(showDialog(options, buttons));
    } else if (value === 'wi') {
      const options = {
        closeCb: () => false,
        content: (
          <WorkItemModal />
        ),
      };
      const buttons = [];
      this.props.dispatch(showDialog(options, buttons));
    } else if (value === 'g') {
      const options = {
        closeCb: () => false,
        content: (
          <CreateGoal />
        ),
        className: 'create-goal-modal-container',
      };
      const buttons = [];

      this.props.dispatch(showDialog(options, buttons));
    }

    this.setState({isAddMenuOpened: false, addMenuRef: null});
  }

  openAddMenu = (event) => {
    this.setState({isAddMenuOpened: true, addMenuRef: event.currentTarget});
  }

  closeAddMenu = () => {
    this.setState({isAddMenuOpened: false});
  }

  renderAdd() {
    if (this.props.isUserLoggedIn) {
      if (this.props.userInfo && this.props.userInfo.workspaceRole !== ROLE.ADMIN) return;

      const addItemArr = [
        {text: 'Workspace', type: 'w'},
        {text: 'Board Folder', type: 'bf'},
        // {text: 'Goal Folder', type: 'gf'},
        {text: 'Board', type: 'b'},
        {text: 'Goal', type: 'g'},
        // {text: 'Nest', type: 'n'},
        // {text: 'Work item', type: 'wi'},
      ];

      return (
        <div className="form-group global-add" onClick={this.openAddMenu}>
          <i className="fas fa-plus" />
          <Popover
            open={this.state.isAddMenuOpened}
            anchorEl={this.state.addMenuRef}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={this.closeAddMenu}
          >
            <Menu onChange={this.handleAddChange.bind(this)}>
              {addItemArr.map((v) => <MenuItem key={v.type} value={v.type} primaryText={v.text} />)}
            </Menu>
          </Popover>
        </div>
      );
    }

    return false;
  }

  handleClickOnUserProfile(event) {
    this.setState({
      isUserInfoOpened: true,
      userInfoRef: event.currentTarget.parentElement,
    });
  }

  handleUserProfileClose() {
    this.setState({isUserInfoOpened: false, userInfoRef: null});
  }

  navigateTo(url) {
    this.setState({isUserInfoOpened: false, userInfoRef: null});
    browserHistory.push(url);
  }

  renderAccountChip() {
    const {
      userInfo,
    } = this.props;

    const isUserInfoOpened = this.state.isUserInfoOpened;

    if (this.props.isUserLoggedIn && userInfo) {

      const workspaces = [];
      userInfo.workspaceList.forEach((wk, index) => {
        const selected = wk.id === userInfo.workspaceId;
        const classString = classnames('workspaceLink', {
          'selected': selected,
        });
        workspaces.push(
          <a key={wk.id} href={`/${wk.id}`} className={classString}>
            {wk.name} {selected ? <i className="fa fa-check" /> : null}
          </a>
        );
      });

      let inviteButton = null;
      if (this.props.userInfo.workspaceRole === ROLE.ADMIN) {
        inviteButton = (<button
          onClick={this.invitePeopleToWorkspace}
          className="button button--secondary"
        > + People
        </button>);
      }

      const loginAs = null;
      // if (this.props.userInfo.isAdmin) {
      //   loginAs = (<a className="menu-link loginas" onClick={this.loginAs.bind(this)}>Login as ...</a>);
      // }

      return (<div>
        <a key="user" className="userInfo" onClick={this.handleClickOnUserProfile.bind(this)}>
          {renderUserIcon(userInfo.name, userInfo.img)}
        </a>

        <Popover
          key="UserPopover"
          open={this.state.isUserInfoOpened}
          anchorEl={this.state.userInfoRef}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onRequestClose={this.handleUserProfileClose.bind(this)}
          animation={PopoverAnimationVertical}
        >
          <div key="userInfoDetail" className="userInfoDetail">
            <div className="flex flex-center">
              {renderUserIcon(userInfo.name, userInfo.img)}
              <div>
                <div className="name">{userInfo.name}</div>
                <div className="email">{userInfo.email}</div>
              </div>
            </div>

            <div className="clearfix" />

            <a className="menu-link" onClick={this.navigateTo.bind(this, '/settings/account')}>My account</a>
            <a className="menu-link" onClick={this.navigateTo.bind(this, '/settings/workspace')}>Workspaces</a>

            {workspaces}
            <div className="clearfix workspace-actions">
              <div className="col-sm-6">
                <button onClick={this.newWorkspace} className="button button--secondary">New</button>
              </div>
              <div className="col-sm-6">
                {inviteButton}
              </div>
            </div>

            <div className="clearfix" />
            {loginAs}
            <a className="menu-link signout" onClick={this.signout}>Sign out</a>
          </div>
        </Popover>
      </div>);
    }

    return false;
  }

  signout = () => {
    delete localStorage.workcycle_io_token;

    this.handleUserProfileClose();

    this.props.dispatch(invalidateCompanyData());
    this.props.dispatch(invalidateAuth());

    browserHistory.push('/signin');
  };

  loginAs() {
    const options = {
      closeCb: () => false,
      content: (
        <LoginAs />
      ),
    };
    const buttons = [];

    this.props.dispatch(showDialog(options, buttons));
    this.handleUserProfileClose();
  }

  invitePeopleToWorkspace = () => {
    const {
      company: {
        lastWorkspace,
      },
    } = this.props;

    const workspace = {id: lastWorkspace};

    const options = {
      closeCb: () => false,
      content: (
        <WorkspaceMembers workspace={workspace} />
      ),
    };
    const buttons = [];

    this.props.dispatch(showDialog(options, buttons));
    this.handleUserProfileClose();
  };

  newWorkspace = () => {
    const options = {
      closeCb: () => false,
      content: (
        <Workspace />
      ),
    };
    const buttons = [];

    this.props.dispatch(showDialog(options, buttons));

    this.handleUserProfileClose();
  };

  renderLeftSide() {
    return (
      <div className="header-left-side flex-center-space-between">
        {this.renderHamburgerIcon()}
        {this.renderTitle()}
        {this.renderSearch()}
        {this.renderAdd()}
      </div>
    );
  }

  renderRightSide() {
    return (
      <div className="header-right-side flex-center-space-between">
        {this.renderAccountChip()}
      </div>
    );
  }

  renderNav() {
    const {isUserLoggedIn} = this.props;

    if (isUserLoggedIn) {
      return (
        <Navigation isNavOpened={this.state.isNavOpened} closeNav={this.handleClickOnHamburgerMenu}/>
      );
    }

    return false;
  }

  render() {
    // TODO: render only the title when the user is not logged in
    return (
      <div className={this.getContainerClassString()}>
        {this.renderLeftSide()}
        {this.renderRightSide()}
        {this.renderNav()}
      </div>
    );
  }
}

Header.defaultProps = {
  isUserLoggedIn: false,
};

Header.propTypes = {
  company: PropTypes.object,
  dispatch: PropTypes.func,
  isUserLoggedIn: PropTypes.bool,
  userInfo: PropTypes.object,
  params: PropTypes.object,
};

export default connect((state) => ({
  userInfo: state.auth.userInfo,
}))(Header);
