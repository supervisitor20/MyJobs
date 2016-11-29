import {createAction} from 'redux-actions';

export const setPageData = createAction('SET_PAGE_DATA');
export const queryMongo = createAction('QUERY_MONGO');

export function doGetPageData() {
  return async (dispatch, _, {api}) => {
    const rawPageData = await api.getInitialPageData();
    dispatch(setPageData(rawPageData));
  };
}

// export function doTableFilter(filterName, tabId) {
//   return async (dispatch, _, {api}) => {
//     dispatch(markPageLoadingAction(true));
//     const filterRequest = {
//       filterName: filterName,
//     };
//     const tableFilterData = await.api.getSelectedFilterData(filterRequest);
//     dispatch(setPageData(tableFilterData));
//     dispatch(markPageLoadingAction(false));
//   };
// }

export function doMongoQuery() {
  return async (dispatch, _, {api}) => {
    const query = await api.addFilters();
    dispatch(queryMongo(query));
  };
}
