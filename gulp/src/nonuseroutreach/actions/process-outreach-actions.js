import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';
import {
  map,
  flatten,
  assign,
  omit,
  mapValues,
  isPlainObject,
  isEmpty,
  isUndefined,
} from 'lodash-compat';

/**
 * We have learned about workflow states.
 *
 * states: e.g. [{value: nn, display: Reviewed}]
 */
export const receivedWorkflowStates =
  createAction('NUO_RECEIVED_WORKFLOW_STATES');

/**
 *  Determine what the state of the process view should be
 */
export const determineProcessStateAction =
  createAction('NUO_DETERMINE_STATE');

/**
 * We have a new search field or we are starting over.
 */
export const resetProcessAction = createAction('NUO_RESET_PROCESS',
  (outreachId, outreach, workflowStates) =>
    ({outreachId, outreach, workflowStates}));

/**
 * Use chose a partner.
 *
 *  partnerId: database id of partner
 *  partner: partner data
 */
export const choosePartnerAction = createAction('NUO_CHOOSE_PARTNER',
    (partnerId, name) => ({partnerId, name}));

/**
 * Use chose a contact.
 *
 *  contactId: database id of contact
 *  contact: contact data
 */
export const chooseContactAction = createAction('NUO_CHOOSE_CONTACT',
    (contactId, name) => ({contactId, name}));

/**
 * Use chose to create a new partner
 *
 *  partnerName: Name chosen to start creating the new partner.
 */
export const newPartnerAction = createAction('NUO_NEW_PARTNER',
    (partnerName) => ({partnerName}));

/**
 * Use chose to create a new contact
 *
 *  contactName: Name chosen to start creating the new contact.
 */
export const newContactAction = createAction('NUO_NEW_CONTACT',
    (contactName) => ({contactName}));

/**
 * User wants to see a the new partner.
 */
export const editPartnerAction = createAction('NUO_EDIT_PARTNER');

/**
 * User wants to see a new contact.
 *
 * contactIndex: which one
 */
export const editContactAction = createAction('NUO_EDIT_CONTACT',
  contactIndex => ({contactIndex}));

/**
 * User wants to see the new communication record.
 */
export const editCommunicationRecordAction =
  createAction('NUO_EDIT_COMMUNICATIONRECORD');

/**
 * User wants to remove partner from the record
 */
export const deletePartnerAction = createAction('NUO_DELETE_PARTNER');

/**
 * User wants to remove contact from the record
 *
 * contactIndex: which one
 */
export const deleteContactAction = createAction('NUO_DELETE_CONTACT',
  contactIndex => ({contactIndex}));

/**
 * User wants to remove the communication record object
 */

export const deleteCommunicationRecordAction =
  createAction('NUO_DELETE_COMMUNICATIONRECORD');

/**
 * User edited a form.
 *
 * form: Which form the user edited, e.g. partner, contact, communciationrecord
 * field: field name, e.g. name, address, etc.
 * value: new value for the form field.
 * formIndex: For contact, an index to the form.
 */
export const editFormAction = createAction('NUO_EDIT_FORM',
  (form, field, value, formIndex) => ({form, field, value, formIndex}));

/**
 * convert an outreach record to have more js friendly keys
 *
 * record: record from api
 *
 * returns: the same record with friendlier keys.
 */
export function convertOutreach(record) {
  return {
    dateAdded: record.date_added,
    outreachBody: record.email_body,
    outreachFrom: record.from_email,
    outreachInbox: record.outreach_email,
    workflowState: record.current_workflow_state,
    outreachSubject: record.subject,
  };
}

/**
 * We have new form data from the API
 *
 * forms: new forms from the API
 */
export const noteFormsAction = createAction('NUO_NOTE_FORMS');

/**
 * Convert [{id: vv, name: nn}, ...] to [{value: vv, display: nn}]
 */
export function convertWorkflowStates(states) {
  return map(states, s => ({value: s.id, display: s.name}));
}

/**
 * Start the process by loading an outreach record and workflow states.
 *
 * outreachId: id for the outreach to load.
 */
export function doLoadEmail(outreachId) {
  return async (dispatch, getState, {api}) => {
    try {
      const outreach = await api.getOutreach(outreachId);
      const states = await api.getWorkflowStates();
      dispatch(
        resetProcessAction(
          outreachId,
          convertOutreach(outreach),
          convertWorkflowStates(states)));
    } catch (e) {
      dispatch(errorAction(e.message));
    }
  };
}


/**
 * Convert [{field: '', message: ''}, ...] to {field: message, ...}
 */
export function extractErrorObject(fieldArray) {
  return assign({}, ...map(fieldArray, p => ({[p.field]: p.message})));
}

/**
 * Return object with the "errors" key removed.
 */
function withoutEmptyValuesOrErrors(obj) {
  const withoutErrors =
    mapValues(obj, v => isPlainObject(v) ? omit(v, 'errors') : v);
  return omit(withoutErrors, o =>
    isPlainObject(o) && isEmpty(o) || isUndefined(o));
}

/**
 * Move fields of contact objects around to make the api happy.
 */
export function formatContact(contact) {
  if (contact.pk.value) {
    return contact;
  }
  return withoutEmptyValuesOrErrors({
    pk: {value: ''},
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    location: withoutEmptyValuesOrErrors({
      pk: {value: ''},
      address_line_one: contact.address_line_one,
      address_line_two: contact.address_line_two,
      city: contact.city,
      state: contact.state,
      label: contact.label,
    }),
    // TODO: fix tags
    tags: [],
    notes: contact.notes,
  });
}

/**
 * Flatten fields of contact data received from API
 */
export function flattenContact(contact) {
  return assign({}, ...flatten(map(contact, (v, k) => {
    if (k === 'location') {
      return v;
    }
    return {[k]: v};
  })));
}

/**
 * Prepare an api forms object for merging with local record object.
 */
export function formsFromApi(forms) {
  const result = {};
  if (forms.outreachrecord) {
    result.outreachrecord = {...forms.outreachrecord};
  }

  if (forms.partner) {
    result.partner = {...forms.partner};
  }

  if (forms.contacts) {
    result.contacts = map(forms.contacts, c => flattenContact(c));
  }

  if (forms.contactrecord) {
    result.communicationrecord = {...forms.contactrecord};
  }

  return result;
}

/**
 * Prepare local record object for sending to the api.
 */
export function formsToApi(forms) {
  return {
    outreachrecord: withoutEmptyValuesOrErrors({...forms.outreachrecord}),
    partner: withoutEmptyValuesOrErrors({...forms.partner}),
    contacts: map(forms.contacts, c => formatContact(c)),
    contactrecord: withoutEmptyValuesOrErrors({...forms.communicationrecord}),
  };
}

/**
 * Submit data to create a communication record.
 */
export function doSubmit(validateOnly, onSuccess) {
  return async (dispatch, getState, {api}) => {
    const process = getState().process;
    const record = process.record;
    const withOutreach = {
      ...record,
      outreachrecord: {
        ...record.outreachrecord,
        pk: {value: process.outreachId},
      },
    };
    const forms = formsToApi(withOutreach);
    try {
      const request = {forms};
      await api.submitContactRecord(request, validateOnly);
      if (!validateOnly && onSuccess) {
        onSuccess();
      }
    } catch (e) {
      if (e.data) {
        const apiErrors = e.data.api_errors;
        if (apiErrors) {
          dispatch(errorAction(apiErrors[0]));
        }
        if (e.data.forms) {
          dispatch(noteFormsAction(formsFromApi(e.data.forms)));
        }
      } else {
        dispatch(errorAction(e.message));
      }
    }
  };
}
