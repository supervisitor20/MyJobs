import {createAction} from 'redux-actions';

/**
 * Some kind of error occurred.
 *
 * message: an error message.
 * data: may be undefined; a list of:
 *   {
 *     field: string name of a field to associated with this error;
 *       may be undefined.
 *     message: string message to show the user.
 *   }
 */
export const errorAction = createAction('ERROR', (message, data) =>
  ({message, data}));


/**
 * Reset error state back to no errors.
 *
 * no payload
 */
export const clearErrorsAction = createAction('CLEAR_ERRORS');
