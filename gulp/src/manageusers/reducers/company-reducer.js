import {difference, forOwn, union} from 'lodash-compat';
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
  currentUser: null,
  users: {},
  roles: {},
  validation: initialValidation,
};

export default handleActions({
  'SET_CURRENT_USER': (state, action) => ({
    ...state,
    currentUser: action.payload,
  }),
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
    const {validation} = state;
    const roles = union(action.payload, validation.roles.value);
    return {
      ...state,
      validation: {
        ...validation,
        roles: {
          ...validation.roles,
          value: roles,
          errors: Object.keys(roles).length ? [] : [
            'A user must be assigned to at least one role.',
          ],
        },
      },
    };
  },
  'REMOVE_ROLES': (state, action) => {
    const {validation, users, currentUser} = state;
    const newRoles = difference(validation.roles.value, action.payload);
    const admins = {};

    forOwn(users, (value, key) => {
      const roles = key === currentUser ? newRoles : value.roles;
      if (roles.indexOf('Admin') > -1) {
        admins[key] = roles;
      }
    });

    const errors = [];
    if (!Object.keys(newRoles).length) {
      errors.push('A user must be assigned to at least one role.');
    }

    if (!Object.keys(admins).length) {
      errors.push('Each company must have at leat one user assigned to the ' +
                  'Admin role.');
    }

    return {
      ...state,
      validation: {
        ...validation,
        roles: {
          ...validation.roles,
          value: newRoles,
          errors: errors,
        },
      },
    };
  },
}, initialCompany);
