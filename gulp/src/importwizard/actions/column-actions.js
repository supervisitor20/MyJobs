import {createAction} from 'redux-actions';
import {errorAction} from 'common/actions/error-actions';

// Note: Each of the asynchronous calls will dispatch an `errorAction` if an
// exception was thrown.

export const updateDataAction = createAction('UPDATE_DATA');

/* doImportFiles
 * Given an array of :files: asychronously parse those files into a JSON object
 * to be later converted into partners, contacts, and communication records.
 */
export function doImportFiles(files) {
  return async (dispatch, _, {api}) => {
    try {
      const data = await api.importFiles(files);
      console.log(data);
      dispatch(updateDataAction(data));
    } catch (exception) {
      dispatch(errorAction(exception.message));
    }
  };
}
