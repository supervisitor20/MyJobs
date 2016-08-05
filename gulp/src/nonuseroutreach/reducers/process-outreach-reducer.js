import {handleActions} from 'redux-actions';

const defaultState = {
  record: {
    partner: {},
    contact: [],
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
 *  partner: information for the selected partner
 *  partnerId: id for the selected partner
 *  contacts: info for selected contacts
 *  contactIds: ids for selected contacts
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
    const {partner, partnerId} = action.payload;

    return {
      ...state,
      state: 'SELECT_CONTACT',
      partnerId,
      partner,
    };
  },

  'NUO_CHOOSE_CONTACT': (state, action) => {
    const {contact, contactId} = action.payload;

    return {
      ...state,
      state: 'NEW_COMMUNICATIONRECORD',
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

  'NUO_NEW_CONTACT': (state, action) => {
    const {contactName} = action.payload;

    const newState = {
      ...state,
      state: 'NEW_CONTACT',
      contactId: '',
      contact: {
        name: contactName,
      },
    };

    return newState;
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
}, defaultState);
