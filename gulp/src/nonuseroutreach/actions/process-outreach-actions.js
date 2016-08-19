import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';
import {find, map} from 'lodash-compat/collection';
import {get, assign} from 'lodash-compat/object';

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
 * We have learned about some errors present.
 *
 * errors: Errors from the api.
 */
export const noteErrorsAction = createAction('NUO_NOTE_ERRORS');

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
 * Submit data to create a communication record.
 */
export function doSubmit(validateOnly) {
  return async (dispatch, getState, {api}) => {
    try {
      const process = getState().process;
      const record = process.record;
      const workflowStates = await api.getWorkflowStates();
      const reviewed = find(workflowStates, s => s.name === 'Complete');
      const request = {
        outreachrecord: {
          pk: process.outreachId,
          current_workflow_state: reviewed.id,
        },
        partner: record.partner,
        contacts: map(record.contacts, c => ({
          pk: '',
          name: c.name,
          email: c.email,
          phone: c.phone,
          location: {
            pk: '',
            address_line_one: c.address_line_one,
            address_line_two: c.address_line_two,
            city: c.city,
            state: c.state,
            label: c.label,
          },
          // TODO: fix tags
          tags: [],
          notes: c.notes,
        })),
        contactrecord: record.communicationrecord,
      };
      await api.submitContactRecord(request, validateOnly);
      // TODO: do something with response.
    } catch (e) {
      if (e.data) {
        const formErrors = e.data.form_errors;
        const errors = {
          partner: extractErrorObject(get(formErrors, 'partner', [])),
          contacts: map(get(formErrors, 'contacts', []), ce =>
            extractErrorObject(ce)),
          communicationrecord: extractErrorObject(
            get(formErrors, 'contactrecord', [])),
        };
        dispatch(noteErrorsAction(errors));
      } else {
        dispatch(errorAction(e.message));
      }
    }
  };
}
