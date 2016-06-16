import {findIndex} from 'lodash-compat';
import {handleActions} from 'redux-actions';

import {validateEmailAddress} from '../../common/email-validators';

export const emptyInbox = {
  pk: null,
  originalEmail: null,
  email: '',
  errors: [],
  valid: false,
};

export const inboxState = {
  inboxManagement: {
    inboxes: [
      emptyInbox,
    ],
  },
};

export const inboxManagementReducer = handleActions({
  'VALIDATE_INBOX': (state, action) => {
    const inbox = action.payload;
    const validator = validateEmailAddress(inbox.email);
    const alreadyExists = state.inboxes.filter(i =>
      i.pk && i.email === inbox.email).length;
    const newInbox = {
      ...inbox,
      ...validator,
      errors: [
        ...validator.errors,
        ...alreadyExists ? ['An inbox with this email already exists.'] : [],
      ],
    };
    const index = findIndex(state.inboxes, i => i.pk === inbox.pk);

    return {
      ...state,
      inboxes: index > -1 ? [
        ...state.inboxes.slice(0, index),
        newInbox,
        ...state.inboxes.slice(index + 1),
      ] : [
        ...state.inboxes,
        inbox,
      ],
    };
  },
  'ADD_INBOX': (state, action) => {
    const inbox = action.payload;
    const newInbox = {...emptyInbox, ...inbox};
    const index = findIndex(state.inboxes, i => inbox.email === i.email);

    return index > -1 ? {
      ...state,
      inboxes: [
        ...state.inboxes.slice(0, index),
        newInbox,
        ...state.inboxes.slice(index + 1),
      ],
    } : state;
  },
  'GET_INBOXES': (state, action) => {
    const inboxes = action.payload.map(i => ({
      ...emptyInbox,
      ...i,
      originalEmail: i.email,
    }));

    return {
      ...state,
      inboxes: [
        emptyInbox,
        ...inboxes,
      ],
    };
  },
  'UPDATE_INBOX': (state, action) => {
    const updatedInbox = action.payload;
    const inboxIndex = findIndex(state.inboxes, inbox =>
        updatedInbox.pk === inbox.pk);
    const newInbox = {
      ...updatedInbox,
      originalEmail: updatedInbox.email,
    };

    return {
      ...state,
      inboxes: [
        ...state.inboxes.slice(0, inboxIndex),
        newInbox,
        ...state.inboxes.slice(inboxIndex + 1),
      ],
    };
  },
  'RESET_INBOX': (state, action) => {
    const resetInbox = action.payload;
    const inboxIndex = findIndex(state.inboxes, inbox =>
        resetInbox.pk === inbox.pk);
    const newInbox = {
      ...resetInbox,
      email: resetInbox.originalEmail,
    };

    return {
      ...state,
      inboxes: [
        ...state.inboxes.slice(0, inboxIndex),
        newInbox,
        ...state.inboxes.slice(inboxIndex + 1),
      ],
    };
  },
  'DELETE_INBOX': (state, action) => {
    const deletedInbox = action.payload;
    const index = findIndex(state.inboxes, i => deletedInbox.pk === i.pk);

    const result = {
      ...state,
      inboxes: [
        ...state.inboxes.slice(0, index),
        ...state.inboxes.slice(index + 1),
      ],
    };

    return result;
  },
}, inboxState);
