import {handleActions} from 'redux-actions';

export const initialState = {
  recordManagement: {
    records: [],
  },
};

export const recordManagementReducer = handleActions({
  'GET_RECORDS': (state, action) => {
    const records = action.payload;

    return {
      ...state,
      records: records,
    };
  },
}, initialState);
