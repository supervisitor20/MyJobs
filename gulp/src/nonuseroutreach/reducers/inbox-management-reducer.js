import {findIndex} from 'lodash-compat';
import {handleActions} from 'redux-actions';

import {validateEmailAddress} from '../../common/email-validators';

export const initialState = {
  inboxManagement: {
    inboxes: [],
    newInbox: {
      email: '',
      errors: [],
      isValid: false,
    },
    modifiedInboxes: [],
  },
};

export const inboxManagementReducer = handleActions({
  'VALIDATE_EMAIL': (state, action) => {
    const validator = validateEmailAddress(action.payload);
    return {
      ...state,
      newInbox: {
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
  'RESET_INBOX': (state, action) => {
    const {modifiedInboxes} = state;
    const modifiedIndex = findIndex(modifiedInboxes, i =>
      i.pk === action.payload.pk);

    return {
      ...state,
      modifiedInboxes: [
        ...modifiedInboxes.slice(0, modifiedIndex),
        ...modifiedInboxes.slice(modifiedIndex + 1),
      ],
    };
  },
  'MODIFY_INBOX': (state, action) => {
    const {currentInbox, currentEmail} = action.payload;
    const {modifiedInboxes, inboxes} = state;
    const index = findIndex(inboxes, i => i.pk === currentInbox.pk);
    const modifiedIndex = findIndex(modifiedInboxes, i =>
      i.pk === currentInbox.pk);
    const inbox = inboxes[index];
    const modifiedInbox = {
      ...modifiedInboxes[modifiedIndex],
      email: currentEmail,
    };
    let newState;

    if (modifiedIndex > -1) {
      if (inbox.email === modifiedInbox.email) {
        newState = {
          ...state,
          modifiedInboxes: [
            ...modifiedInboxes.slice(0, modifiedIndex),
            ...modifiedInboxes.slice(modifiedIndex + 1),
          ],
        };
      } else {
        newState = {
          ...state,
          modifiedInboxes: [
            ...modifiedInboxes.slice(0, modifiedIndex),
            modifiedInbox,
            ...modifiedInboxes.slice(modifiedIndex + 1),
          ],
        };
      }
    } else {
      newState = {
        ...state,
        modifiedInboxes: [
          ...modifiedInboxes,
          {...inbox, email: currentEmail},
        ],
      };
    }

    return newState;
  },
}, initialState);
