import {
  errorAction,
} from '../../common/actions/error-actions';

import {
  replaceActivitiesListAction,
} from './activities-list-actions';

/**
 * Calling activities API
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
