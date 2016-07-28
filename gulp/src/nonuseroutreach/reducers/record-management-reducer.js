import {handleActions} from 'redux-actions';

export const initialRecords = [];

export const recordManagementReducer = handleActions({
  /* payload: records
   * state changes: all records are replaced
   */
  'GET_RECORDS': (state, action) => {
    return action.payload;
  },
  'FILTER_RECORDS': (state, action) => {
    return {
      ...state,
      filteredRecords: action.payload
    };
  },
}, initialRecords);
