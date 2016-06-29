import {handleActions} from 'redux-actions';

export const initialColumns = {
  partner: {},
  contact: {},
  record: {},
};

export const columnReducer = handleActions({
  'UPDATE_DATA': state => state,
}, initialColumns);
