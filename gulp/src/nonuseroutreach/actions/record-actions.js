import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

export const getRecordsAction = createAction('GET_RECORDS');

export const filterRecordsAction = createAction('FILTER_RECORDS');

// Note: Each of the asynchronous calls will dispatch an `errorAction` if an
// exception was thrown.

/* doGetRecords
 * Asynchronously fetches an updated list of outreach records and dispatches
 * `getRecordsAction`.
 */
export function doGetRecords() {
  return async (dispatch, _, {api}) => {
    try {
      const records = await api.getExistingOutreachRecords();
      dispatch(getRecordsAction(records));
    } catch (exception) {
      dispatch(errorAction(exception.message));
    }
  };
}

/* doFilterRecords
  Adds or updates filtered records object for display
 */
export function doFilterRecords(filteredRecords) {
  return (dispatch) =>
    dispatch(filterRecordsAction(filteredRecords))
}
