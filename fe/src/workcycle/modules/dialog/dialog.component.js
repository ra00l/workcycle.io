/**
 * @namespace dialog.component
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classNames from 'classnames';

// components
import Button from '../../components/button/button.component';

// actions
import {dismissDialog} from './dialog.actions';


/**
 * Prefix for logging
 *
 * @private
 * @memberOf dialog.component
 * @const {String}
 * @default
 */
const LOG_PREFIX = '[dialog.component]';

/**
 * Custom dialog component. It receives everything needed from store.
 *
 * @class Dialog
 * @memberOf dialog.component
 * @extends React.Component
 *
 * @example
 * // Component is included with:
 * <Dialog />
 */
export class Dialog extends Component {

  setBodyStyle(isModalDispayed) {
    if (isModalDispayed) {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * When dialog is closed from "X" button or from button with close functionality
   * this function will dismiss dialog and if there is any callback it will call it.
   *
   * @memberOf dialog.component.Dialog
   * @method closeHandler
   */
  closeHandler = () => {
    if (this.props.dialog.closeCb) {
      // if dialog has closeCb, call it
      this.props.dialog.closeCb();
    }
    this.props.dispatch(dismissDialog());

    this.setBodyStyle(false);
  };

  /**
   * Glass panel click handler
   *
   * @memberOf dialog.component.Dialog
   * @method glassPaneClickHandler
   *
   * @param {MouseEvent} e - Mouse Event
   */
  glassPaneClickHandler = (e) => {
    if (!this.props.dialog.isModal && e.target === this.refs.modalRef) {
      // TODO: close the modal when the user is clicking outside ?
      // this.closeHandler();
    }
  };

  /**
   * Returns the correct css class the dialog
   *
   * @memberOf dialog.component.Dialog
   * @method getDialogClass
   *
   * @return {String} css class
   */
  getDialogClass() {
    const {
      dialog: {
        className,
      },
    } = this.props;

    return classNames('clearfix content-wrapper container', {
      [className]: className,
    });
  }

  /**
   * Render button
   *
   * @memberOf dialog.component.Dialog
   * @method renderButton
   *
   * @param {Object} buttonProp - Button properties
   * @param {Number} buttonIndex - Button index
   * @return {JSX} HTML Content
   */
  renderButton(buttonProp, buttonIndex) {
    return (
      <Button
        key={buttonIndex}
        label={buttonProp.label}
        onClick={buttonProp.onClickCb}
        type={buttonProp.type}
      />
    );
  }

  /**
   * Render buttons
   *
   * @memberOf dialog.component.Dialog
   * @method renderButtons
   *
   * @return {JSX|Boolean} HTML Content | false
   */
  renderButtons() {
    const {dialog} = this.props;

    if (dialog.buttons) {
      const buttonsLength = dialog.buttons.length;
      if (buttonsLength) {
        for (let i = 0; i < buttonsLength; i += 1) {
          if (dialog.buttons[i].clickCb) {
            // at click execute action then dismiss dialog
            dialog.buttons[i].onClickCb = () => {
              dialog.buttons[i].clickCb();
              this.closeHandler();
            };
          } else {
            // if callback for click was not set, then assign close dialog as callback
            dialog.buttons[i].onClickCb = this.closeHandler;
          }
        }

        return (
          <div className="dialog-footer">
            {dialog.buttons.map(this.renderButton)}
          </div>
        );
      }
    }

    return false;
  }

  /**
   * Render confirmation icon
   *
   * @memberOf dialog.component.Dialog
   * @method renderConfirmationIcon
   * @return {JSX} HTML Content
   */
  renderConfirmationIcon() {
    if (this.props.dialog.isConfirmation) {
      return (
        <div className="icon-confirmation---warning item-warning" />
      );
    }

    return false;
  }

  /**
   * Render content
   *
   * @memberOf dialog.component.Dialog
   * @method renderContent
   *
   * @return {JSX} HTML Content
   */
  renderContent() {
    return (
      <div className="content clearfix">
        {this.props.dialog.content}
      </div>
    );
  }

  /**
   * Render
   *
   * @memberOf dialog.component.Dialog
   * @method render
   *
   * @return {JSX|Boolean} HTML Content | false
   */
  render() {
    const {dialog} = this.props;
    if (dialog.isShown === true) {
      this.setBodyStyle(true);

      return (
        <div ref="modalRef" onClick={this.glassPaneClickHandler} className="dialog dialog--glass-pane">
          <div className={this.getDialogClass()}>
            <div className="dialog-header">
              <i onClick={this.closeHandler} className="dialog-header-close fa fa-times pull-right" />
              <div className="dialog-header-title">{dialog.title}</div>
            </div>
            {/* {this.renderConfirmationIcon()} */}
            {this.renderContent()}
            {this.renderButtons()}
          </div>
        </div>
      );
    }

    return false;
  }
}

Dialog.propTypes = {
  dialog: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  dialog: state.dialog,
}))(Dialog);
