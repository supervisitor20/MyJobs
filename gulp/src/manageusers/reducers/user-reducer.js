import {handleActions} from 'redux-actions';

export const initialUsers = {};

export default handleActions({
  'UPDATE_USERS': (state, action) => ({...state, ...action.payload}),
}, initialUsers);
