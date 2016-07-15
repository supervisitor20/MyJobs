import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

export const setErrorsAction = createAction('SET_ERRORS');
export const updateUsersAction = createAction('UPDATE_USERS');
export const updateRolesAction = createAction('UPDATE_ROLES');
export const validateEmailAction = createAction('VALIDATE_EMAIL');
export const addRolesAction = createAction('ADD_ROLES');
export const removeRolesAction = createAction('REMOVE_ROLES');
export const clearValidationAction = createAction('CLEAR_VALIDATION');
export const clearErrorsAction = createAction('CLEAR_ERRORS');
export const setCurrentUser = createAction('SET_CURRENT_USER');

/**
 * Asynchronously fetches an updated users object where keys are user ids and
 * values represent pertinent user information.
 */
export function doRefreshUsers() {
  return async (dispatch, _, {api}) => {
    try {
      const results = await api.getUsers();
      dispatch(updateUsersAction(results));
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}

/**
 * Asynchronously fetches an updated roles object where keys are role ids and
 * values represent pertinent role information.
 */
export function doRefreshRoles() {
  return async (dispatch, _, {api}) => {
    try {
      const results = await api.getAllRoles();
      dispatch(updateRolesAction(results));
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}

export function doUpdateUserRoles(userId, added, removed) {
  return async (dispatch, _, {api}) => {
    try {
      const result = await api.updateUserRoles(userId, added, removed);
      dispatch(result.errors.length ?
        setErrorsAction(result.errors) :
        // TODO: Do we want to notify the user of the exact changes?
        doRefreshUsers());
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}

export function doAddUser(email, roles) {
  return async (dispatch, _, {api}) => {
    try {
      await api.addUser(email, roles);
      // TODO: Do we want to notify the user of the exact changes?
      dispatch(doRefreshUsers());
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}

export function doRemoveUser(userId) {
  return async (dispatch, _, {api}) => {
    try {
      await api.removeUser(userId);
      dispatch(doRefreshUsers());
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}
