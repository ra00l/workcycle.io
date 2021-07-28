/**
 * api interface
 *
 * @namespace api.urls
 */

 /**
  * API base url. for local dev, use 'http://localhost:3456/api'
  * API base for heroku: 'https://workcycle.creativeclr.com/api'
  * API base for AWS: '/api' || http://ec2-34-244-21-147.eu-west-1.compute.amazonaws.com/api
  *
  * @memberOf api.urls
  * @name API_BASE
  * @const {String}
  */
const API_BASE = process.env.API_BASE || '/api';
// const API_BASE = 'https://app.workcycle.io/api';
// const API_BASE = 'https://ec2-34-244-21-147.eu-west-1.compute.amazonaws.com/api';

/**
 * API Interface
 *
 * @memberOf api.urls
 * @name API
 * @const {Object}
 */
const API = {
  LOGIN: `${API_BASE}/account/login`,
  REGISTER: `${API_BASE}/account/create-team`,
  RESET_PASSWORD: `${API_BASE}/account/forgot`,
  CHANGE_PASSWORD: `${API_BASE}/account/reset/{token}`,
  ACCOUNT_SETTINGS: `${API_BASE}/account/update`,
  GLOBAL_SEARCH: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/search`,
  INVITATION: {
    GET: `${API_BASE}/account/invitation/{token}`,
    ACCEPT: `${API_BASE}/account/invitation/{token}`,
  },
  AUTH: {
    USER_INFO: `${API_BASE}/account/validate/{workspaceId}`,
    LOGIN_AS: `${API_BASE}/account/loginas`,
  },
  BOARDS: {
    LIST: `${API_BASE}/workspace/{workspaceId}/board/list`,
    CREATE: `${API_BASE}/workspace/{workspaceId}/board`,
    BOARD: `${API_BASE}/workspace/{workspaceId}/board/{entityId}`,
    DELETE: `${API_BASE}/workspace/{workspaceId}/board/{boardId}`,
    CLONE: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/clone`,
    SAVE_TEMPLATE: `${API_BASE}/workspace/{workspaceId}/template/create/{boardId}`,
    GET_TEMPLATES: `${API_BASE}/workspace/{workspaceId}/template/list/board`,
    GET_CHANGES: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/changes/{pageNum}`,
    GET_MEMBERS: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/users`,
    SAVE_MEMBERS: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/users`,
    GET_FIELDS: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/fields`,
    GET_NESTS: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/nests`,
  },
  FOLDERS: {
    CREATE_BOARD: `${API_BASE}/workspace/{workspaceId}/board/folder`,
    CREATE_GOAL: `${API_BASE}/workspace/{workspaceId}/goal/folder`,
    FOLDER: `${API_BASE}/workspace/{workspaceId}/board/folder/{folderId}`,
    DELETE: `${API_BASE}/workspace/{workspaceId}/board/folder/{folderId}`,
  },
  FIELDS: {
    CREATE: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/add-field`,
    UPDATE: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/field/{fieldId}`,
    DELETE: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/field/{fieldId}`,
    CLONE: `${API_BASE}/workspace/{workspaceId}/board/{boardId}/field/{fieldId}/clone`,
  },
  NEST: {
    CREATE: `${API_BASE}/board/{boardId}/nest`,
    UPDATE: `${API_BASE}/board/{boardId}/nest/{nestId}`,
    DELETE: `${API_BASE}/board/{boardId}/nest/{nestId}`,
    CLONE: `${API_BASE}/board/{boardId}/nest/clone/{nestId}`,
  },
  GOALS: {
    LIST: `${API_BASE}/workspace/{workspaceId}/goal/list`,
    CREATE: `${API_BASE}/workspace/{workspaceId}/goal`,
    GOAL: `${API_BASE}/workspace/{workspaceId}/goal/{entityId}`,
    GET_FIELDS: `${API_BASE}/workspace/{workspaceId}/goal/{boardId}/fields`,
    MIN: '/mocks/list_of_goals_with_minimal_info.json',
    CLONE: `${API_BASE}/workspace/{workspaceId}/goal/{boardId}/clone`,
  },
  WORK_ITEMS: {
    LIST: `${API_BASE}/board/{boardId}/work-item/list`,
    CREATE: `${API_BASE}/board/{boardId}/work-item`,
    UPDATE: `${API_BASE}/board/{boardId}/work-item/{workItemId}`,
    UPDATE_CUSTOM_FIELD: `${API_BASE}/board/{boardId}/work-item/{workItemId}/field`,
    DELETE: `${API_BASE}/board/{boardId}/work-item/{workItemId}`,
    GET_WORKITEM: `${API_BASE}/board/{boardId}/work-item/{workItemId}`,
    ADD_COMMENT: `${API_BASE}/board/{boardId}/work-item/{workItemId}/comment`,
    REMOVE_COMMENT: `${API_BASE}/board/{boardId}/work-item/{workItemId}/comment/{commentId}`,
    UPDATE_COMMENT: `${API_BASE}/board/{boardId}/work-item/{workItemId}/comment/{commentId}`,
    UPLOAD_FILE_FOR_ITEM: `${API_BASE}/board/{boardId}/work-item/{workItemId}/file`,
    REMOVE_FILE: `${API_BASE}/board/{boardId}/work-item/{workItemId}/file/{fileId}`,
  },
  WORKSPACES: {
    CREATE: `${API_BASE}/workspace`,
    LIST: `${API_BASE}/workspace/list`,
    DELETE: `${API_BASE}/workspace/{workspaceId}`,
    DETAIL: `${API_BASE}/workspace/{workspaceId}`,
    MEMBERS: `${API_BASE}/workspace/{workspaceId}/users`,
  },
  EDITOR: {
    UPLOAD_IMAGE: `${API_BASE}/workspace/{workspaceId}/add-image`,
  },
  SETTINGS: {

  },
};

export {
  API,
};
