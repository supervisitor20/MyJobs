import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

/**
 * We have a new search field or we are starting over.
 *
 *  instance: search instance to work with
 */
export const resetProcessAction = createAction('NUO_RESET_PROCESS',
  (email) => ({email}));

/**
 * Start the process by loading an email record.
 *
 * recordId: id for the email to load.
 */
export function doLoadEmail(recordId) {
  return async (dispatch, getState, {api}) => {
    try {
      const email = await api.getEmail(recordId);
      dispatch(resetProcessAction(email));
    } catch (e) {
      dispatch(errorAction(e.message));
    }
  };
}
