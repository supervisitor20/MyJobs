import {handleActions} from 'redux-actions';
import {get} from 'lodash-compat';

const defaultState = {
  record: {
    partner: {},
    contacts: [],
    communicationrecord: {},
  },
};

/**
 * Represents the state of processing an NUO outreach record. {
 *
 *  state: string constant, What the user is doing right now.
 *    SELECT_PARTNER: the user is selecting a partner (or contact)
 *    NEW_PARTNER: the user is editing a new partner
 *    SELECT_CONTACT: the user is selecting a contact AFTER selecting a partner
 *    NEW_CONTACT: the user is editng a new contact
 *    NEW_COMMUNICATIONRECORD: the user is editing the new record
 *    SELECT_WORKFLOW_STATE: the user is picking the new workflow state
 *
 *  outreach: information for the current outreach record
 *  outreachId: id for the current outreach record
 *  contactIndex: if editing a contact, which one is the user concerned with?
 *  form: when editing, information for the form fields
 *  record: The record which will be submitted {
 *    outreachrecord: the outreach record we are working on
 *    partner: field contents for new partner
 *    contacts: [{ field contents for new contacts}]
 *    communicationrecord: field contents for record
 *  }
 */
export default handleActions({
  'NUO_RESET_PROCESS': (state, action) => {
    const {outreach, outreachId} = action.payload;

    return {
      ...defaultState,
      state: 'SELECT_PARTNER',
      outreach,
      outreachId,
    };
  },

  'NUO_CHOOSE_PARTNER': (state, action) => {
    const {name, partnerId} = action.payload;

    return {
      ...state,
      state: 'SELECT_CONTACT',
      record: {
        ...state.record,
        partner: {
          pk: partnerId,
          partnername: name,
        },
      },
    };
  },

  'NUO_CHOOSE_CONTACT': (state, action) => {
    const {name, contactId} = action.payload;

    return {
      ...state,
      state: 'NEW_COMMUNICATIONRECORD',
      record: {
        ...state.record,
        contacts: [
          ...state.record.contacts,
          {
            pk: contactId,
            name,
          },
        ],
      },
    };
  },

  'NUO_NEW_PARTNER': (state, action) => {
    const {partnerName} = action.payload;

    const newState = {
      ...state,
      state: 'NEW_PARTNER',
      record: {
        ...state.record,
        partner: {
          pk: '',
          name: partnerName,
        },
      },
    };

    delete newState.contactId;
    delete newState.contact;

    return newState;
  },

  'NUO_NEW_CONTACT': (state, action) => {
    const {contactName} = action.payload;
    const {contacts} = state.record;
    const newIndex = contacts.length;

    const newState = {
      ...state,
      state: 'NEW_CONTACT',
      contactIndex: newIndex,
      record: {
        ...state.record,
        contacts: [
          ...state.record.contacts,
          {
            pk: '',
            name: contactName,
          },
        ],
      },
    };

    return newState;
  },

  'NUO_EDIT_PARTNER': (state) => {
    if (get(state, 'record.partner.pk')) {
      return {
        ...state,
        state: 'SELECT_PARTNER',
      };
    }
    return {
      ...state,
      state: 'NEW_PARTNER',
    };
  },

  'NUO_EDIT_CONTACT': (state, action) => {
    const {contactIndex} = action.payload;

    const pk = get(state, `record.contact.${contactIndex}.pk`);
    const newState = pk ? 'SELECT_CONTACT' : 'NEW_CONTACT';
    return {
      ...state,
      state: newState,
      contactIndex,
    };
  },

  'NUO_EDIT_COMMUNICATIONRECORD': (state) => {
    return {
      ...state,
      state: 'NEW_COMMUNICATIONRECORD',
    };
  },

  'NUO_RECEIVE_FORM': (state, action) => {
    const {form} = action.payload;

    return {
      ...state,
      form,
    };
  },

  'NUO_EDIT_FORM': (state, action) => {
    const {form: formName, formIndex, field, value} = action.payload;

    if (formIndex || formIndex === 0) {
      const formSet = (state.record || {})[formName] || [];
      const form = formSet[formIndex] || {};

      const newForm = {
        ...form,
        [field]: value,
      };

      const newFormSet = [...form];
      newFormSet[formIndex] = newForm;

      return {
        ...state,
        record: {
          ...state.record,
          [formName]: newFormSet,
        },
      };
    }

    const form = (state.record || {})[formName] || {};

    return {
      ...state,
      record: {
        ...state.record,
        [formName]: {
          ...form,
          [field]: value,
        },
      },
    };
  },

  'NUO_SAVE_PARTNER': (state) => {
    return {
      ...state,
      state: 'SELECT_CONTACT',
    };
  },

  'NUO_SAVE_CONTACT': (state) => {
    return {
      ...state,
      state: 'NEW_COMMUNICATIONRECORD',
    };
  },

  'NUO_NOTE_ERRORS': (state, action) => {
    const errors = action.payload;

    return {
      ...state,
      errors,
    };
  },
}, defaultState);
