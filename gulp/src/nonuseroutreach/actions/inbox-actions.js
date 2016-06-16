import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

export const validateInboxAction = createAction('VALIDATE_INBOX');
export const addInboxAction = createAction('ADD_INBOX');
export const getInboxesAction = createAction('GET_INBOXES');
export const resetInboxAction = createAction('RESET_INBOX');
export const updateInboxAction = createAction('UPDATE_INBOX');
export const deleteInboxAction = createAction('DELETE_INBOX');

export function doAddInbox(inbox) {
  return async (dispatch, _, {api}) => {
    try {
      const newInbox = await api.createNewInbox(inbox.email);
      dispatch(addInboxAction(newInbox));

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

export function doUpdateInbox(inbox) {
  return async (dispatch, _, {api}) => {
    try {
      const response = await api.updateInbox(inbox.pk, inbox.email);
      if (response.status === 'success') {
        dispatch(updateInboxAction(inbox));
      } else {
        dispatch(errorAction(response.status));
      }
    } catch (exception) {
      dispatch(errorAction(exception.message));
    }
  };
}

export function doDeleteInbox(inbox) {
  return async (dispatch, _, {api}) => {
    try {
      const response = await api.deleteInbox(inbox.pk);
      if (response.status === 'success') {
        dispatch(deleteInboxAction(inbox));

        const inboxes = await api.getExistingInboxes();
        dispatch(getInboxesAction(inboxes));
      } else {
        dispatch(errorAction(response.status));
      }
    } catch (exception) {
      dispatch(errorAction(exception.message));
    }
  };
}
