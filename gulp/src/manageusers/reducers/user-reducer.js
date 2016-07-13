import {handleActions} from 'redux-actions';

export const initialUsers = {};

export default handleActions({
  'UPDATE_USERS': (state, action) => action.payload,
}, initialUsers);
