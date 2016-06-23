import {
  errorAction,
} from '../../common/actions/error-actions';

import {
  replaceActivitiesListAction,
} from './activities-list-actions';



/**
 * User refreshed a report.
 *
 * reportId: id of report to refresh
 */
export function doRefreshActivities() {
  return async (dispatch, _, {api}) => {
    try {
      // Get activities once, and only once
      const results = await api.get('/manage-users/api/activities/');
      dispatch(replaceActivitiesListAction(results));
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}
