import {handleActions} from 'redux-actions';

import {validateEmailAddress} from '../../common/email-validators';

export default handleActions({
  'VALIDATE_EMAIL': (state, action) => {
    const validator = validateEmailAddress(action.payload);
    return {
      ...state,
      newInbox: {
        ...state.newInbox,
        email: action.payload,
        errors: validator.errors,
        isValid: validator.success,
      },
    };
  },
  'CREATE_INBOX': (state) => ({
    // TODO: Create a notification when an inbox is created
    ...state,
    newInbox: {
      email: '',
      errors: [],
      isValid: false,
    },
  }),
  'GET_INBOXES': (state, action) => ({...state, inboxes: action.payload}),
}, {
  inboxes: [],
  newInbox: {
    email: '',
    errors: [],
    isValid: false,
  },
});
