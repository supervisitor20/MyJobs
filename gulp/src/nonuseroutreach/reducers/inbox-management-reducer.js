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
}, {
  inboxes: [],
  newInbox: {
    email: '',
    errors: [],
    isValid: false,
  },
});
