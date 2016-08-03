import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

/**
 * We have a new search field or we are starting over.
 */
export const resetProcessAction = createAction('NUO_RESET_PROCESS',
  (emailId, email) => ({emailId, email}));

/**
 * Use chose a partner.
 *
 *  partnerId: database id of partner
 *  partner: partner data
 */
export const choosePartnerAction = createAction('NUO_CHOOSE_PARTNER',
    (partnerId, partner) => ({partnerId, partner}));

/**
 * Use chose a contact.
 *
 *  contactId: database id of contact
 *  contact: contact data
 */
export const chooseContactAction = createAction('NUO_CHOOSE_CONTACT',
    (contactId, contact) => ({contactId, contact}));

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
 * Form information arrived.
 *
 *  form: form data
 */
export const receiveFormAction = createAction('NUO_RECEIVE_FORM',
    (form) => ({form}));

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
 * Start the process by loading an email record.
 *
 * recordId: id for the email to load.
 */
export function doLoadEmail(recordId) {
  return async (dispatch, getState, {api}) => {
    try {
      const email = await api.getEmail(recordId);
      dispatch(resetProcessAction(recordId, email));
    } catch (e) {
      dispatch(errorAction(e.message));
    }
  };
}

/**
 * Load a form definition from the api.
 *
 * formName: e.g. partner, contact, contactrecord, etc.
 * id: optional, id of item to prefill the form with.
 */
export function doLoadForm(formName, id) {
  return async (dispatch, _, {api}) => {
    try {
      const form = await api.getForm(formName, id);
      dispatch(receiveFormAction(form));
    } catch (e) {
      dispatch(errorAction(e.message));
    }
  };
}

/**
 * Submit data to create a communication record.
 */
export function doSubmit() {
  return async (dispatch, getState, {api}) => {
    const request = {
      partner: getState().process.formContents.PARTNER,
      contact: getState().process.formContents.CONTACT,
      contactrecord: getState().process.formContents.COMMUNICATIONRECORD,
    };
    const response = await api.submitContactRecord(request);
    console.log('doSubmit response', response);
  };
}
