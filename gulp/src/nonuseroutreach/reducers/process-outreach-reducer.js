import {handleActions} from 'redux-actions';
import {isEmpty, get} from 'lodash-compat';

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
 *    CONTACT_APPEND: the user is adding notes to an existing contact
 *    NEW_COMMUNICATIONRECORD: the user is editing the new record
 *    SELECT_WORKFLOW_STATE: the user is picking the new workflow state
 *
 *  outreach: information for the current outreach record
 *  outreachId: id for the current outreach record
 *  workflowStates: list of known workflow states {value:.., display:..}
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
    const {outreach, outreachId, workflowStates} = action.payload;

    return {
      ...defaultState,
      state: 'SELECT_PARTNER',
      outreach,
      outreachId,
      workflowStates,
    };
  },

  'NUO_DETERMINE_STATE': (state) => {
    let currentState;
    if (isEmpty(state.record.partner)) {
      currentState = 'SELECT_PARTNER';
    } else if (isEmpty(state.record.contacts)) {
      currentState = 'SELECT_CONTACT';
    } else if (isEmpty(state.record.communicationrecord)) {
      currentState = 'NEW_COMMUNICATIONRECORD';
    } else {
      currentState = 'SELECT_WORKFLOW_STATE';
    }
    return {
      ...state,
      state: currentState,
    };
  },

  'NUO_CHOOSE_PARTNER': (state, action) => {
    const {name, partnerId} = action.payload;

    return {
      ...state,
      record: {
        ...state.record,
        partner: {
          pk: {value: partnerId},
          name: {value: name},
        },
      },
    };
  },

  'NUO_CHOOSE_CONTACT': (state, action) => {
    const {name, contactId} = action.payload;

    return {
      ...state,
      record: {
        ...state.record,
        contacts: [
          ...state.record.contacts,
          {
            pk: {value: contactId},
            name: {value: name},
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
          pk: {value: ''},
          name: {value: partnerName},
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
            pk: {value: ''},
            name: {value: contactName},
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

    const pk = get(state, `record.contacts[${contactIndex}].pk.value`);
    const newState = pk ? 'CONTACT_APPEND' : 'NEW_CONTACT';
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

  'NUO_DELETE_PARTNER': (state) => {
    // filter out contacts with a PK (i.e. existing contacts that would be
    // linked to the soon-to-be-removed parter
    const newContacts = state.record.contacts.filter(contact => !contact.pk);
    return {
      ...state,
      record: {
        ...state.record,
        partner: {},
        contacts: newContacts,
      },
    };
  },

  'NUO_DELETE_CONTACT': (state, action) => {
    const {contactIndex} = action.payload;
    const splicedContacts = state.record.contacts.slice();
    splicedContacts.splice(contactIndex, 1);

    return {
      ...state,
      record: {
        ...state.record,
        contacts: splicedContacts,
      },
    };
  },


  'NUO_DELETE_COMMUNICATIONRECORD': (state) => {
    return {
      ...state,
      record: {
        ...state.record,
        communicationrecord: {},
      },
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
      const valueData = form[field] || {};

      const newValueData = {
        ...valueData,
        value,
      };

      const newForm = {
        ...form,
        [field]: newValueData,
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
    const valueData = form[field] || {};

    const newValueData = {
      ...valueData,
      value,
    };

    return {
      ...state,
      record: {
        ...state.record,
        [formName]: {
          ...form,
          [field]: newValueData,
        },
      },
    };
  },

  'NUO_NOTE_FORMS': (state, action) => {
    const record = action.payload;

    return {
      ...state,
      record,
    };
  },
}, defaultState);
