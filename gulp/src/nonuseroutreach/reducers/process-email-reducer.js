import {handleActions} from 'redux-actions';

const defaultState = {
  formContents: {
    PARTNER: {},
    CONTACT: [],
    COMMUNICATIONRECORD: {},
  },
};

/**
 * Represents the state of processing an NUO email. {
 *
 *  state: string constant, What the user is doing right now.
 *    SELECT_PARTNER: the user is selecting a partner (or contact)
 *    NEW_PARTNER: the user is editing a new partner
 *    SELECT_CONTACT: the user is selecting a contact AFTER selecting a partner
 *    NEW_CONTACT: the user is editng a new contact
 *    NEW_COMMUNICATIONRECORD: the user is editing the new record
 *    SELECT_WORKFLOW_STATE: the user is picking the new workflow state
 *
 *  email: information for the current email
 *  emailId: id for the current email
 *  partner: information for the selected partner
 *  partnerId: id for the selected partner
 *  contacts: info for selected contacts
 *  contactIds: ids for selected contacts
 *  form: when editing, information for the form fields
 *  formContents: {
 *    PARTNER: field contents for new partner
 *    CONTACTS: [{ field contents for new contacts}]
 *    COMMUNICATIONRECORD: field contents for record
 *  }
 */
export default handleActions({
  'NUO_RESET_PROCESS': (state, action) => {
    const {email, emailId} = action.payload;

    return {
      ...defaultState,
      state: 'SELECT_PARTNER',
      email,
      emailId,
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
      const formSet = (state.formContents || {})[formName] || [];
      const form = formSet[formIndex] || {};

      const newForm = {
        ...form,
        [field]: value,
      };

      const newFormSet = [...form];
      newFormSet[formIndex] = newForm;

      return {
        ...state,
        formContents: {
          ...state.formContents,
          [formName]: newFormSet,
        },
      };
    }

    const form = (state.formContents || {})[formName] || {};

    return {
      ...state,
      formContents: {
        ...state.formContents,
        [formName]: {
          ...form,
          [field]: value,
        },
      },
    };
  },
}, defaultState);
