import {createAction} from 'redux-actions';

export const setPageData = createAction('SET_PAGE_DATA');
export const changeActiveDimension = createAction('CHANGE_ACTIVE_DIMENSION');
export const applyTableFilter = createAction('APPLY_TABLE_FILTER');
export const markPageLoadingAction = createAction('MARK_PAGE_LOADING');
export const queryMongo = createAction('QUERY_MONGO');

export function doGetPageData() {
  return async (dispatch, _, {api}) => {
    const rawPageData = await api.getInitialPageData();
    dispatch(setPageData(rawPageData));
  };
}

export function doGetActiveFilterData(){
  return async (dispatch, _, {api}) => {
    const activeFilterData = await api.getInitialPageData();
    dispatch(changeActiveDimension(activeFilterData));
  }
}


export function doApplyTableFilter(){
  return async (dispatch, _, {api}) => {
    const applyTableFilterData = await api.getInitialPageData();
    dispatch(applyTableFilter(applyTableFilterData));
  }
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
