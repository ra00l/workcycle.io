import fieldsService from './fields.service';

import {
  SET_FIELDS,
  CREATE_FIELD_REQUEST,
  CREATE_FIELD_REQUEST_SUCCESS,
  CREATE_FIELD_REQUEST_FAILURE,
  UPDATE_FIELD_REQUEST,
  UPDATE_FIELD_REQUEST_SUCCESS,
  UPDATE_FIELD_REQUEST_FAILURE,
  ORDER_FIELD_REQUEST,
  ORDER_FIELD_REQUEST_SUCCESS,
  ORDER_FIELD_REQUEST_FAILURE,
  DELETE_FIELD_REQUEST,
  DELETE_FIELD_REQUEST_SUCCESS,
  DELETE_FIELD_REQUEST_FAILURE,
  CLONE_FIELD_REQUEST,
  CLONE_FIELD_REQUEST_SUCCESS,
  CLONE_FIELD_REQUEST_FAILURE,
} from './fields.constants';

const privateService = {};

privateService.createField = (workspaceId, boardId, field) => (dispatch, getState) => {
  dispatch({type: CREATE_FIELD_REQUEST});

  // call api
  fieldsService.createField(workspaceId, boardId, field)
    .then(response => {
      dispatch({
        type: CREATE_FIELD_REQUEST_SUCCESS,
        payload: {
          data: {
            ...field,
            ...response,
          },
          fieldId: response.id,
        },
      });
    }, err => {
      if (err && err.status && err.status === 412) {
        dispatch({
          type: CREATE_FIELD_REQUEST_FAILURE,
          meta: {
            notification: {
              message: 'ERRORS.LIMITED_PERMISSION',
            },
          },
          error: true,
        });
      }
      const errorMessage = 'FIELDS.FIELD.MESSAGES';
      dispatch({
        type: CREATE_FIELD_REQUEST_FAILURE,
        meta: {
          notification: {
            message: `${errorMessage}.${err.errors[0].code}`,
            messageArguments: {
              fieldName: field.name,
            },
          },
        },
        error: true,
      });
    });
};

privateService.updateField = (workspaceId, boardId, fieldId, field) => (dispatch, getState) => {
  dispatch({type: UPDATE_FIELD_REQUEST});

  // call api
  fieldsService.updateField(workspaceId, boardId, fieldId, field)
    .then(response => {
      dispatch({
        type: UPDATE_FIELD_REQUEST_SUCCESS,
        payload: {
          field,
          fieldId: fieldId,
        },
      });
    }, err => {
      const errorMessage = 'FIELDS.FIELD.MESSAGES.FIELD_UPDATE_FAILURE';
      dispatch({
        type: UPDATE_FIELD_REQUEST_FAILURE,
        meta: {
          notification: {
            message: errorMessage,
          },
        },
        error: true,
      });
    });
};

privateService.orderField = (workspaceId, boardId, fieldId, field, fieldPosition) => (dispatch, getState) => {
  dispatch({type: ORDER_FIELD_REQUEST});

  // call api
  fieldsService.updateField(workspaceId, boardId, fieldId, field)
    .then(response => {
      const position = fieldPosition - 1; // (fieldPosition - 1) > 0 ? fieldPosition - 1 : 0;
      dispatch({
        type: ORDER_FIELD_REQUEST_SUCCESS,
        payload: {
          fieldId,
          fieldPosition: position,
        },
      });
    }, err => {
      const errorMessage = 'FIELDS.FIELD.MESSAGES.FIELD_UPDATE_FAILURE';
      dispatch({
        type: ORDER_FIELD_REQUEST_FAILURE,
        meta: {
          notification: {
            message: errorMessage,
          },
        },
        error: true,
      });
    });
};

privateService.deleteField = (workspaceId, boardId, fieldId) => (dispatch, getState) => {
  dispatch({type: DELETE_FIELD_REQUEST});

  // call api
  fieldsService.deleteField(workspaceId, boardId, fieldId)
    .then(response => {
      dispatch({
        type: DELETE_FIELD_REQUEST_SUCCESS,
        payload: {
          fieldId,
        },
      });
    }, err => {
      const errorMessage = 'FIELDS.FIELD.MESSAGES.FIELD_NOT_FOUND';
      dispatch({
        type: DELETE_FIELD_REQUEST_FAILURE,
        meta: {
          notification: {
            message: errorMessage,
          },
        },
        error: true,
      });
    });
};

privateService.cloneField = (workspaceId, boardId, fieldId) => (dispatch, getState) => {
  dispatch({type: CLONE_FIELD_REQUEST});

  // call api
  fieldsService.cloneField(workspaceId, boardId, fieldId)
    .then(response => {
      dispatch({
        type: CLONE_FIELD_REQUEST_SUCCESS,
        payload: {
          fieldIdToClone: fieldId,
          fieldId: response.id,
        },
      });
    }, err => {
      const errorMessage = 'FIELDS.FIELD.MESSAGES.FIELD_NOT_FOUND';
      dispatch({
        type: CLONE_FIELD_REQUEST_FAILURE,
        meta: {
          notification: {
            message: errorMessage,
          },
        },
        error: true,
      });
    });
};

const createField = (workspaceId, boardId, field) => (dispatch, getState) =>
  dispatch(privateService.createField(workspaceId, boardId, field));

const deleteField = (workspaceId, boardId, fieldId) => (dispatch, getState) =>
  dispatch(privateService.deleteField(workspaceId, boardId, fieldId));

const updateField = (workspaceId, boardId, fieldId, field) => (dispatch, getState) =>
  dispatch(privateService.updateField(workspaceId, boardId, fieldId, field));

const orderField = (workspaceId, boardId, fieldId, field, fieldPosition) => (dispatch, getState) =>
dispatch(privateService.orderField(workspaceId, boardId, fieldId, field, fieldPosition));

const cloneField = (workspaceId, boardId, fieldId) => (dispatch, getState) =>
dispatch(privateService.cloneField(workspaceId, boardId, fieldId));

const setFields = (data) => (dispatch, getState) =>
  dispatch({
    type: SET_FIELDS,
    payload: {
      data: data.fields,
      sorted: data.sorted,
    },
  });

export {
  setFields,
  createField,
  deleteField,
  updateField,
  orderField,
  cloneField,
};
