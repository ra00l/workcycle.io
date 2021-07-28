import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {AtomicBlockUtils, EditorState, Modifier} from 'draft-js';
import {Editor} from 'react-draft-wysiwyg';

class MentionMenu extends Component {

  state = {expanded: false};

  componentWillMount() {
    const {editorState, modalHandler} = this.props;

    // modalHandler.registerCallBack(this.expandCollapse.bind(this));
  }

  componentWillUnmount() {
    const {modalHandler} = this.props;
    // modalHandler.deregisterCallBack(this.expandCollapse.bind(this));
  }

  expandCollapse() {
    this.setState({expanded: !this.state.expanded});
  }

  insertText(text) {
    const {editorState, onChange} = this.props;
    const contentState = Modifier.insertText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      `<a href="">@${text}</a> `,
      editorState.getCurrentInlineStyle(),
    );
    onChange(EditorState.push(editorState, contentState, 'insert-characters'));

    this.setState({opened: false});
  }

  insertHtml(text) {
    const {editorState, onChange} = this.props;
    // const contentState = editorState.getCurrentContent();
    // const contentStateWithEntity = contentState.createEntity('MENTION', 'IMMUTABLE', {text: `@${text}`, value: text, url: '#'});

    const entityKey = editorState
      .getCurrentContent()
      .createEntity('MENTION', 'IMMUTABLE', {text: `@${text}`, value: text, url: ''})
      .getLastCreatedEntityKey();

    // const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    // let newEditorState = EditorState.set(editorState, {
    //   currentContent: contentStateWithEntity,
    // });

    // newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, `@${text}`);
    let newEditorState = EditorState.acceptSelection(editorState);
    const contentState = Modifier.replaceText(
      newEditorState.getCurrentContent(),
      '',
      `@${text}`,
      newEditorState.getCurrentInlineStyle(),
      entityKey,
    );
    newEditorState = EditorState.push(newEditorState, contentState, 'insert-characters');

    onChange(newEditorState);
  }

  selectMention(opt) {
    this.insertHtml(opt.text);
  }

  renderModal() {
    // return (<ul className="rdw-colorpicker-modal">
    //   {this.props.options.map(o => (
    //     <li key={o.value} onClick={this.insertHtml.bind(this, o.text)}>{o.text}</li>
    //   ))}
    // </ul>);

    return (<div
      className="rdw-colorpicker-modal"
      onClick={(evt) => (evt.stopPropagation())}
    >
      <span className="rdw-colorpicker-modal-header">Select users to notify</span>
      <span className="rdw-colorpicker-modal-options">
        {
          this.props.options.map((c, index) =>
            (<a
              key={index}
              className="rdw-colorpicker-option"
              onClick={this.selectMention.bind(this, c)}
            >
              {c.text}
            </a>))
        }
      </span>
    </div>);
  }

  render() {
    return (
      <div className="editor-menu">
        <div className="rdw-block-wrapper">
          <div className="rdw-option-wrapper" onClick={() => this.setState({expanded: true})}>@</div>
        </div>
        {this.state.expanded ? this.renderModal() : undefined}
      </div>
    );
  }
}

MentionMenu.defaultProps = {};

MentionMenu.propTypes = {
  options: PropTypes.array.isRequired,
  editorState: PropTypes.object,
  onChange: PropTypes.func,
  modalHandler: PropTypes.object,
};

export default MentionMenu;
