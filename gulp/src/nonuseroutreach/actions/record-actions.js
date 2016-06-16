import {createAction} from 'redux-actions';
import {errorAction} from '../../common/actions/error-actions';

export const getRecordsAction = createAction('GET_RECORDS');

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
