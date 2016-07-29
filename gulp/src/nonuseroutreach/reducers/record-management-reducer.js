import {handleActions} from 'redux-actions';

export const initialRecords = [];

export const recordManagementReducer = handleActions({
  /* payload: records
   * state changes: all records are replaced
   */
  'GET_RECORDS': (state, action) => {
    return action.payload;
  },
}, initialRecords);
