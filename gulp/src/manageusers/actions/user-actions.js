import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

export const updateUsersAction = createAction('UPDATE_USERS');

/**
 * Asynchronously fetches an updated users object where keys are user ids and
 * values represent pertinent user information.
 */
export function doRefreshUsers() {
  return async (dispatch, _, {api}) => {
    try {
      const results = await api.get('/manage-users/api/users/');
      dispatch(updateUsersAction(results));
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}
