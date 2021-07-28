import {fromJS, Map} from 'immutable';

// constants
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


const INITIAL_STATE = fromJS({
  data: null,
  sorted: [],
  isActionInProgress: false,
});

const deleteField = (state, action) => {
  const index = state.get('sorted').findIndex(id => id === action.payload.fieldId);
  const sorted = state.get('sorted').delete(index);

  return state.withMutations((newState) =>
    newState
      .deleteIn(['data', action.payload.fieldId])
      .set('sorted', sorted)
      .set('actionInProgress', false));
};

const orderField = (state, action) => {
  const {
    fieldId,
    fieldPosition,
  } = action.payload;

  // remove the nest id from the sorted list
  const index = state.get('sorted').findIndex(id => id === fieldId);
  const sorted = state.get('sorted').delete(index);

  // insert into the correct position
  const list = sorted.insert(fieldPosition, fieldId);

  return state.withMutations((newState) =>
    newState
      .set('sorted', list)
      .set('actionInProgress', false));
};

const cloneField = (state, action) => {
  const {
    fieldIdToClone,
    fieldId,
  } = action.payload;
  const fieldThatWillBeCloned = state.getIn(['data', `${fieldIdToClone}`]).toJS();
  const field = {
    ...fieldThatWillBeCloned,
    id: fieldId,
  };

  return state.withMutations(
    (nextState) =>
      nextState
        .set('actionInProgress', false)
        .updateIn(['sorted'], arr => arr.push(fieldId))
        .mergeIn(['data', `${action.payload.fieldId}`], fromJS(field))
  );
};

const fields = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_FIELDS:
      return state.withMutations((newState) =>
        newState
          .merge(fromJS(action.payload))
      );
    case CREATE_FIELD_REQUEST_SUCCESS:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', false)
            .updateIn(['sorted'], arr => arr.push(action.payload.fieldId))
            .mergeIn(['data', `${action.payload.fieldId}`], Map(action.payload.data))
      );
    case CREATE_FIELD_REQUEST:
    case DELETE_FIELD_REQUEST:
    case UPDATE_FIELD_REQUEST:
    case ORDER_FIELD_REQUEST:
    case CLONE_FIELD_REQUEST:
      return state.withMutations(
        (nextState) =>
        nextState
          .set('actionInProgress', true)
      );
    case UPDATE_FIELD_REQUEST_SUCCESS:
      return state.withMutations(
        (nextState) =>
          nextState
            .set('actionInProgress', false)
            .mergeIn(['data', action.payload.fieldId], fromJS(action.payload.field))
      );
    case ORDER_FIELD_REQUEST_SUCCESS:
      return orderField(state, action);
    case ORDER_FIELD_REQUEST_FAILURE:
    case CREATE_FIELD_REQUEST_FAILURE:
    case DELETE_FIELD_REQUEST_FAILURE:
    case UPDATE_FIELD_REQUEST_FAILURE:
    case CLONE_FIELD_REQUEST_FAILURE:
      return state.withMutations(
        (nextState) =>
        nextState
          .set('actionInProgress', true)
      );
    case DELETE_FIELD_REQUEST_SUCCESS:
      return deleteField(state, action);
    case CLONE_FIELD_REQUEST_SUCCESS:
      return cloneField(state, action);
    default:
      return state;
  }
};

export default fields;
