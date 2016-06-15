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


export const initialState = {
  inboxManagement: {
    inboxes: [],
    newInbox: {
      email: '',
      errors: [],
      isValid: false,
    },
    modifiedInboxes: [],
    // will eventually replace inboxes
    newInboxes: [
      emptyInbox,
    ],
  },
};

export const inboxManagementReducer = handleActions({
  // Experimental Reducers
  'VALIDATE_INBOX': (state, action) => {
    const currentInbox = action.payload;
    const validator = validateEmailAddress(currentInbox.email);
    const newInbox = {...currentInbox, ...validator};
    const inboxIndex = findIndex(state.newInboxes, inbox =>
        currentInbox.pk === inbox.pk);

    return {
      ...state,
      newInboxes: inboxIndex > -1 ? [
        ...state.newInboxes.slice(0, inboxIndex),
        newInbox,
        ...state.newInboxes.slice(inboxIndex + 1),
      ] : [
        ...state.newInboxes,
        newInbox,
      ],
    };
  },
  'ADD_INBOX': (state, action) => {
    const newInbox = action.payload;
    const inboxIndex = findIndex(state.newInboxes, inbox =>
        newInbox.pk === inbox.pk);

    return inboxIndex > -1 ? {
      ...state,
      newInboxes: [
        ...state.newInboxes.slice(0, inboxIndex),
        newInbox,
        ...state.newInboxes.slice(inboxIndex + 1),
      ],
    } : state;
  },
  'GET_INBOXES': (state, action) => ({...state, newInboxes: action.payload}),
  'UPDATE_INBOX': (state, action) => {
    const updatedInbox = action.payload;
    const inboxIndex = findIndex(state.newInboxes, inbox =>
        updatedInbox.pk === inbox.pk);
    const newInbox = {
      ...updatedInbox,
      originalEmail: updatedInbox.email,
    };

    return {
      ...state,
      newInboxes: [
        ...state.newInboxes.slice(0, inboxIndex),
        newInbox,
        ...state.newInboxes.slice(inboxIndex + 1),
      ],
    };
  },
  'RESET_INBOX': (state, action) => {
    const resetInbox = action.payload;
    const inboxIndex = findIndex(state.newInboxes, inbox =>
        resetInbox.pk === inbox.pk);
    const newInbox = {
      ...resetInbox,
      email: resetInbox.originalEmail,
    };

    return {
      ...state,
      newInboxes: [
        ...state.newInboxes.slice(0, inboxIndex),
        newInbox,
        ...state.newInboxes.slice(inboxIndex + 1),
      ],
    };
  },
  'DELETE_INBOX': (state, action) => {
    const deletedInbox = action.payload;
    const inboxIndex = findIndex(state.newInboxes, inbox =>
        deletedInbox.pk === inbox.pk);

    return {
      ...state,
      newInboxes: [
        ...state.newInboxes.slice(0, inboxIndex),
        ...state.newInboxes.slice(inboxIndex + 1),
        emptyInbox,
      ],
    };
  },
}, initialState);
