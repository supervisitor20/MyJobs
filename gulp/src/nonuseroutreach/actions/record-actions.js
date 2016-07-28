import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

export const getRecordsAction = createAction('GET_RECORDS');
export const updateTermFilterAction = createAction('TERM_FILTER');
export const updateWorkflowFilterAction = createAction('WORKFLOW_FILTER');
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

/* doUpdateTermFilter
  Updates the term filter applied to NUO Records table
 */
export function doUpdateTermFilter(term_filter) {
  return (dispatch) =>
    dispatch(updateTermFilterAction(term_filter))
}

/* doUpdateWorkflowFilter
  Updates the workflow filter applied to the NUO Records table
 */

export function doUpdateWorkflowFilter(workflow_filter) {
  return (dispatch) =>
    dispatch(updateWorkflowFilterAction(workflow_filter))
}

/* doFilterRecords
  Adds or updates filtered records object for display
 */
export function doFilterRecords(filteredRecords) {
  return (dispatch) =>
    dispatch(filterRecordsAction(filteredRecords))
}
