import {createAction} from 'redux-actions';



/**
 * We have a new list of activities.
 *
 * payload is a list of objects like:
   {
      activity_name: "create product",
      app_access_name: "MarketPlace",
      activity_description: "Add new products",
      activity_id: 33,
      app_access_id: 5
    }
 */
export const replaceActivitiesListAction = createAction('REPLACE_ACTIVITIES_LIST');
