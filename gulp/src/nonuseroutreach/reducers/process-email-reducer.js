import {handleActions} from 'redux-actions';

const defaultState = {};

export default handleActions({
  'NUO_RESET_PROCESS': (state, action) => {
    const {email} = action.payload;

    return {
      ...state,
      state: 'RESET',
      email,
    };
  },
}, defaultState);
