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
 * Form information arrived.
 *
 *  form: form data
 */
export const receiveFormAction = createAction('NUO_RECEIVE_FORM',
    (form) => ({form}));

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
