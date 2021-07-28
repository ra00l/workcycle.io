import draftToHtml from 'draftjs-to-html';
import {ContentState, convertToRaw, EditorState} from 'draft-js';
import htmlToDraft from 'html-to-draftjs';
import apiEndpointsService from '../api/api.endpoints';
import {API} from '../api/api.urls';
import api from '../api/api.ws.service';
import workItemService from '../workItems/workItem/workItem.service';

let RESULTS = [];
let STRING = '';

const privateService = {};

privateService.getFromBetween = (sub1, sub2) => {
  if (STRING.indexOf(sub1) < 0 || STRING.indexOf(sub2) < 0) {
    return false;
  }

  const SP = STRING.indexOf(sub1) + sub1.length;
  const string1 = STRING.substr(0, SP);
  const string2 = STRING.substr(SP);
  const TP = string1.length + string2.indexOf(sub2);

  return STRING.substring(SP, TP);
};

privateService.removeFromBetween = (sub1, sub2) => {
  if (STRING.indexOf(sub1) < 0 || STRING.indexOf(sub2) < 0) {
    return false;
  }

  const removal = sub1 + privateService.getFromBetween(sub1, sub2) + sub2;
  STRING = STRING.replace(removal, '');
};

privateService.getAllResults = (sub1, sub2) => {
  // first check to see if we do have both substrings
  if (STRING.indexOf(sub1) < 0 || STRING.indexOf(sub2) < 0) {
    return;
  }

  // find one result
  const result = privateService.getFromBetween(sub1, sub2);
  // push it to the results array
  RESULTS.push(result);
  // remove the most recently found one from the string
  privateService.removeFromBetween(sub1, sub2);

  // if there's more substrings
  if (STRING.indexOf(sub1) > -1 && STRING.indexOf(sub2) > -1) {
    privateService.getAllResults(sub1, sub2);
  } else {
    return null;
  }
};

const get = (users, comment, sub1, sub2) => {
  const arrayOfUsersMentions = [];
  RESULTS = [];
  STRING = comment;
  privateService.getAllResults(sub1, sub2);

  RESULTS.forEach(userName => {
    users.map(user => {
      if (userName === user.get('name')) {
        const userId = user.get('id');
        if (arrayOfUsersMentions.indexOf(userId) === -1) {
          arrayOfUsersMentions.push(userId);
        }
      }
    });
  });

  return arrayOfUsersMentions;
};

const getMentions = (html, users) => {
  const userNameThatAreMentioned = get(users, html, 'data-mention data-value="', '">');

  return userNameThatAreMentioned;
};

const getEditorData = (editorContent, usersArr) => {
  const editorHtml = draftToHtml(convertToRaw(editorContent));
  const mentions = usersArr ? getMentions(editorHtml, usersArr) : null;

  return {
    html: editorHtml,
    mentions: mentions,
  };
};

const getState = (html) => {
  if (!html) return EditorState.createEmpty();

  const contentBlock = htmlToDraft(html);

  const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
  return EditorState.createWithContent(contentState);

};

const uploadImage = (workspaceId, filePayload) => {
  const path = apiEndpointsService.normalizeUrl(API.EDITOR.UPLOAD_IMAGE, {
    workspaceId,
  });

  const options = {
    body: filePayload,
    noAutoHeaders: true,
  };

  return new Promise((resolve, reject) => {
    api.put(path, options)
      .then((response) => {
        resolve(response);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
};

const service = {
  getEditorData,
  getState,
  uploadImage,
};

export default service;
