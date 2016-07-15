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
  // server-side errors
  errors: [],
  // user-level field errors
  validation: initialValidation,
};

export default handleActions({
  'SET_ERRORS': (state, action) => ({...state, errors: action.payload}),
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
  'CLEAR_ERRORS': (state) => ({...state, errors: []}),
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
    const {validation, users, currentUser} = state;
    const newRoles = union(action.payload, validation.roles.value);
    const admins = {};

    forOwn(users, (value, key) => {
      const roles = key === currentUser ? newRoles : value.roles;
      if (roles.indexOf('Admin') > -1) {
        admins[key] = newRoles;
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
