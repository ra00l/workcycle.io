import {fromJS, Map} from 'immutable';

// constants
import {
  ADD_FILTER,
  REMOVE_FILTER,
  SET_FILTERS,
  REMOVE_FILTERS,
} from './boardFilter.constants';

const INITIAL_STATE = fromJS({
  data: {},
});

const boardFilter = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    // case ADD_FILTER:
    //   return state.withMutations(
    //     (nextState) =>
    //       nextState
    //         .updateIn(['sorted'], arr => arr.push(action.payload.data.id))
    //         .mergeIn(['data', `${action.payload.data.id}`], Map(action.payload.data))
    //   );
    // case REMOVE_FILTER:
    //   return state.withMutations(
    //     (nextState) =>
    //       nextState
    //         .updateIn(['sorted'], arr => arr.push(action.payload.data.id))
    //         .mergeIn(['data', `${action.payload.data.id}`], Map(action.payload.data))
    //   );
    case SET_FILTERS:
      return state.withMutations((newState) =>
        newState
          .merge(fromJS(action.payload))
      );
    case REMOVE_FILTERS:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default boardFilter;
