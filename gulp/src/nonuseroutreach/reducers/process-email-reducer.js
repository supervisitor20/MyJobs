import {handleActions} from 'redux-actions';

const defaultState = {};

export default handleActions({
  'NUO_RESET_PROCESS': (state, action) => {
    const {email, emailId} = action.payload;

    return {
      state: 'RESET',
      email,
      emailId,
    };
  },

  'NUO_CHOOSE_PARTNER': (state, action) => {
    const {partner, partnerId} = action.payload;

    return {
      ...state,
      state: 'KNOWN_PARTNER',
      partnerId,
      partner,
    };
  },

  'NUO_CHOOSE_CONTACT': (state, action) => {
    const {contact, contactId} = action.payload;

    return {
      ...state,
      state: 'KNOWN_CONTACT',
      contactId,
      contact,
    };
  },

  'NUO_NEW_PARTNER': (state, action) => {
    const {partnerName} = action.payload;

    const newState = {
      ...state,
      state: 'NEW_PARTNER',
      partnerId: '',
      partner: {
        name: partnerName,
      },
    };

    delete newState.contactId;
    delete newState.contact;

    return newState;
  },

  'NUO_RECEIVE_FORM': (state, action) => {
    const {form} = action.payload;

    return {
      ...state,
      form,
    };
  },
}, defaultState);
