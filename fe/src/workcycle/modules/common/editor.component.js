import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {EditorState, convertToRaw, AtomicBlockUtils} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import {connect} from 'react-redux';
import {Map, fromJS} from 'immutable';
import {Editor} from 'react-draft-wysiwyg';

import editorService from './editor.service';
import MentionMenu from './editor.menu.mention';
import WorkItemMenu from './editor.menu.workitem';


class WorkcycleEditor extends Component {

  static getToolbarConfig() {
    return {
      options: ['inline', 'blockType', 'list', 'colorPicker', 'link'],
      inline: {
        inDropdown: false,
        options: ['bold', 'italic', 'underline', 'strikethrough'],
      },
      blockType: {
        inDropdown: true,
        options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
      },
      list: {
        inDropdown: false,
        options: ['unordered', 'ordered', 'indent', 'outdent'],
      },
      colorPicker: {
        colors: [
          'rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
          'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)',
          'rgb(0,168,133)', 'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)',
          'rgb(40,50,78)', 'rgb(0,0,0)', 'rgb(247,218,100)', 'rgb(251,160,38)',
          'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)', 'rgb(239,239,239)',
          'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
          'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)',
        ],
      },
      link: {
        inDropdown: false,
        showOpenOptionOnHover: true,
        defaultTargetOption: '_blank',
        options: ['link', 'unlink'],
      },
    };
  }

  state = {
    editorPlaceholder: 'Write your update, use @ to mention people from your workspace',
  };

  componentWillMount() {
    if (this.props.disableMention) {
      this.setState({editorPlaceholder: 'Write the description here'});
    }

    this.currentEditorState = this.props.editorState;
  }

  currentEditorState = null;

  onEditorStateChange = (editorState) => {
    this.currentEditorState = editorState;

    this.props.onChange(editorState);
  };

  getUsers() {
    const {users} = this.props;
    const suggestions = [{text: 'all', value: 'all', url: ''}];

    if (users) {
      users.map(user => {
        suggestions.push({
          text: user.get('name'),
          value: user.get('name'),
          url: '',
        });
      });
    }

    return suggestions;
  }

  getWorkItems() {
    const {workItems, workspaceId} = this.props;
    const suggestions = [];

    if (workItems) {
      workItems.map(wi => {
        suggestions.push({
          text: wi.get('title'),
          value: wi.get('id'),
          url: `${workspaceId}/boards/${wi.get('idBoard')}/item/${wi.get('id')}`,
        });
      });
    }

    return suggestions;
  }

  handlePastedFiles(files) {
    if (files.some(file => file.type.indexOf('image') === -1)) {
      return;
    }

    const [file] = files;
    const data = new FormData();
    data.append('file', file);

    editorService.uploadImage(this.props.workspaceId, data)
      .then((img) => {
        const editorState = this.currentEditorState;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          'IMAGE',
          'MUTABLE',
          {src: img.url}, // urlValue
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        let newEditorState = EditorState.set(editorState, {
          currentContent: contentStateWithEntity,
        });

        newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');

        this.onEditorStateChange(newEditorState);
      });

    return 'not-handled';
  }

  render() {

    const mentionList = {
      separator: ' ',
      trigger: '@',
      suggestions: this.getUsers(),
    };

    return (<Editor
      // toolbarOnFocus
      wrapperClassName=""
      editorClassName="add-new-comment-editor"
      toolbar={WorkcycleEditor.getToolbarConfig()}
      editorState={this.props.editorState}
      onEditorStateChange={this.onEditorStateChange}
      handlePastedFiles={this.handlePastedFiles.bind(this)}
      placeholder={this.state.editorPlaceholder}
      toolbarCustomButtons={[<MentionMenu key="mention" options={this.getUsers()} />, <WorkItemMenu key="wi" options={this.getWorkItems()}/>]}
      mention={mentionList}
    />);
  }
}

WorkcycleEditor.defaultProps = {};

WorkcycleEditor.propTypes = {
  editorState: PropTypes.object.isRequired,
  users: PropTypes.object,
  onChange: PropTypes.func,
  disableMention: PropTypes.bool,
  workspaceId: PropTypes.number,
  workItems: PropTypes.object,
};

export default connect((state, props) => {
  const usersStore = state.users;
  const authStore = state.auth;
  const users = usersStore.get('data');
  const workItems = state.workItems.get('data');
  const loggedInUsername = authStore && authStore.userInfo && authStore.userInfo.name || '';
  const workspaceId = authStore && authStore.userInfo && authStore.userInfo.workspaceId;

  return {
    loggedInUsername,
    users,
    workItems,
    workspaceId,
  };
})(WorkcycleEditor);
