import {
  ADD_FILTER,
  REMOVE_FILTER,
  SET_FILTERS,
  REMOVE_FILTERS,
} from './boardFilter.constants';

const addFilter = (filter) => (dispatch, getState) => {
  const payload = {
    filter,
  };

  return dispatch({
    type: ADD_FILTER,
    payload,
  });
};

const removeFilter = (filter) => (dispatch, getState) =>
  dispatch({
    type: REMOVE_FILTER,
    payload: {
      filter,
    },
  });

const setFilters = (filters) => (dispatch, getState) =>
  dispatch({
    type: SET_FILTERS,
    payload: {
      data: filters,
    },
  });

const removeFilters = () => (dispatch, getState) =>
  dispatch({
    type: REMOVE_FILTERS,
    payload: {},
  });

export {
  // addFilter,
  // removeFilter,
  setFilters,
  removeFilters,
};
