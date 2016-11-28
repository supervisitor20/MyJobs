import {createAction} from 'redux-actions';

export const setPageData = createAction('SET_PAGE_DATA');
export const queryMongo = createAction('QUERY_MONGO');

export function doGetPageData() {
  return async (dispatch, _, {api}) => {
    const rawPageData = await api.getInitialPageData();
    dispatch(setPageData(rawPageData));
  };
}

// export function doMongoQuery() {
//   return async ()
// }

// export const applyFilter = () => {
//   return{
//     type: "APPLY_FILTER",
//     payload: {
//       "rows": [
//         {"job_views": "748", "visits": "1050", "browser": "Lorem Ipsum"},
//         {"job_views": "2637", "visits": "841", "browser": "Lorem Ipsum"},
//         {"job_views": "364", "visits": "341", "browser": "Lorem Ipsum"},
//         {"job_views": "1675", "visits": "298", "browser": "Lorem Ipsum"},
//         {"job_views": "123", "visits": "1", "browser": "Lorem Ipsum"},
//         {"job_views": "647", "visits": "1", "browser": "Lorem Ipsum"}
//       ],
//       "column_names": [
//         {"key": "browser", "label": "Lorem Ipsum"},
//         {"key": "job_views", "label": "Lorem Ipsum"},
//         {"key": "visits", "label": "Lorem Ipsum"}
//       ]
//     }
//   }
// }
