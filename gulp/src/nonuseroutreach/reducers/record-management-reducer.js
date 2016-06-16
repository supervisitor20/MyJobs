import {handleActions} from 'redux-actions';

export const initialRecords = [];

export const recordManagementReducer = handleActions({
  'GET_RECORDS': (state, action) => {
    return action.payload;
  },
}, initialRecords);
