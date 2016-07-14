import {union, difference} from 'lodash-compat';
import {handleActions} from 'redux-actions';
import {validateEmail} from 'common/email-validators';

export const initialValidation = {
  email: {
    value: '',
    errors: [],
  },
  roles: {
    value: [],
    errors: [],
  },
};

export const initialCompany = {
  users: {},
  roles: {},
  validation: initialValidation,
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
  'CLEAR_VALIDATION': (state) => ({...state, validation: initialValidation}),
  'VALIDATE_EMAIL': (state, action) => {
    const errors = validateEmail(action.payload) ? [] : [
      'Invalid email address',
    ];
    return {
      ...state,
      validation: {
        ...state.validation,
        email: {
          value: action.payload,
          errors: errors,
        },
      },
    };
  },
  'ADD_ROLES': (state, action) => {
    const roles = union(action.payload, state.roles.value);
    return {
      ...state,
      validation: {
        ...state.validation,
        roles: {
          ...state.roles,
          value: roles,
          errors: Object.keys(roles).length ? [] : [
            'A user must be assigned to at least one role.',
          ],
        },
      },
    };
  },
  'REMOVE_ROLES': (state, action) => {
    const roles = difference(state.roles.value, action.payload);
    return {
      ...state,
      validation: {
        ...state.validation,
        roles: {
          ...state.roles,
          value: roles,
          // TODO: account for last admin
          errors: Object.keys(roles).length ? [] : [
            'A user must be assigned to at least one role.',
          ],
        },
      },
    };
  },
}, initialCompany);
