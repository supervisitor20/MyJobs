import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

export const validateEmailAction = createAction('VALIDATE_EMAIL');

export const createInboxAction =
  createAction('CREATE_INBOX', (pk, email) => ({pk, email}));

export const getInboxesAction = createAction('GET_INBOXES');

export const resetInboxAction = createAction('RESET_INBOX');

export const modifyInboxAction =
  createAction('MODIFY_INBOX', (currentInbox, currentEmail) =>
    ({currentInbox, currentEmail}));

export function doCreateInbox(email) {
  return async (dispatch, _, {api}) => {
    try {
      const inbox = await api.createNewInbox(email);
      dispatch(createInboxAction({...inbox}));
      const inboxes = await api.getExistingInboxes();
      dispatch(getInboxesAction(inboxes));
    } catch (exception) {
      dispatch(errorAction(exception.message));
    }
  };
}

export function doGetInboxes() {
  return async (dispatch, _, {api}) => {
    try {
      const inboxes = await api.getExistingInboxes();
      dispatch(getInboxesAction(inboxes));
    } catch (exception) {
      dispatch(errorAction(exception.message));
    }
  };
}
