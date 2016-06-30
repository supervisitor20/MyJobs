import {handleActions} from 'redux-actions';

/**
 * activities list format example: {
 *
 *   data: [
   {
     activity_name: "create product",
     app_access_name: "MarketPlace",
     activity_description: "Add new products",
     activity_id: 33,
     app_access_id: 5
   },
   {
     activity_name: "read product",
     app_access_name: "MarketPlace",
     activity_description: "View existing products.",
     activity_id: 34,
     app_access_id: 5
   },
 *   ]
 * }
 */
export default handleActions({
  'REPLACE_ACTIVITIES_LIST': (state, action) => {
    const data = action.payload;
    return {
      ...state,
      data,
    };
  },
}, {
  data: [],
});
