import {handleActions} from 'redux-actions';

export const initialCompany = {
  users: {},
  roles: {},
};

export default handleActions({
  'UPDATE_USERS': (state, action) => ({
    ...state,
    users: action.payload,
  }),
  'UPDATE_ROLES': (state, action) => ({
    ...state,
    roles: action.payload,
  }),
}, initialCompany);
