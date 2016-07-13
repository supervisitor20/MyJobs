import {handleActions} from 'redux-actions';
import {validateEmail} from '../../common/email-validators';

export const initialValidation = {
  email: {
    value: '',
    errors: [],
  },
};

export default handleActions({
  'VALIDATE_EMAIL': (state, action) => {
    const errors = validateEmail(action.payload) ? [] : [
      'Invalid email address',
    ];
    return {
      ...state,
      email: {
        value: action.payload,
        errors: errors,
      },
    };
  },
  'CLEAR_VALIDATION': () => initialValidation,
}, initialValidation);
