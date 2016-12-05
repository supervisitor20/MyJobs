import {createAction} from 'redux-actions';

export const setPageData = createAction('SET_PAGE_DATA');
export const setTableData = createAction('SET_TABLE_DATA');
export const setMainDimension = createAction('SET_MAIN_DIMENSION');
export const setSelectedFilterData = createAction('SET_SELECTED_FILTER_DATA');
export const changeActiveDimension = createAction('CHANGE_ACTIVE_DIMENSION');
export const markPageLoadingAction = createAction('FETCH_PAGE_DATA');
export const queryMongo = createAction('QUERY_MONGO');

// Function to set the default loading data for the analytics page
export function doGetPageData(start, end) {
  return async (dispatch, _, {api}) => {
    dispatch(markPageLoadingAction(true));
    const rawPageData = await api.getInitialPageData(start, end);
    dispatch(setPageData(rawPageData));
    dispatch(markPageLoadingAction(false));
  };
}

// export function doGetActiveFilterData() {
//   return async (dispatch, _, {api}) => {
//     const activeFilterData = await api.getInitialPageData();
//     dispatch(changeActiveDimension(activeFilterData));
//   };
// }

export function doGetSelectedFilterData() {
  return async (dispatch, _, {api}) => {
    dispatch(markPageLoadingAction(true));
    const selectedFilterData = await api.getSelectedFilterData();
    dispatch(setSelectedFilterData(selectedFilterData));
    dispatch(markPageLoadingAction(false));
  };
}

// export function doChangeMainDimension(dimensionName){
//     return asyn (dispatch, _, {api}) => {
//       dispatch(markPageLoadingAction(true));
//       const dimensionData = {
//         dimension: dimensionName,
//       }
//       const mainDimensionData = await api.getMainSelectedDimensionData(dimesionData);
//       dispatch(setMainDimension(mainDimensionData));
//       dispatch(markPageLoadingAction(false));
//     }
// }
//
// export function doTableFilter(filterName) {
//   return async (dispatch, _, {api}) => {
//     dispatch(markPageLoadingAction(true));
//     const filterRequest = {
//       filterName: filterName,
//     };
//     const tableFilterData = await.api.getSelectedTableFilterData(filterRequest);
//     dispatch(setTableData(tableFilterData));
//     dispatch(markPageLoadingAction(false));
//   };
// }
//
// export function doDateFilter(startDate, endDate){
//   return async (dispatch, _, {api}) => {
//     dispatch(markPageLoadingAction(true));
//     const dateRequest = {
//       start: startDate,
//       end: endDate,
//     };
//     const dateFilterData = await.api.getSelectedDateRangeData(dateRequest);
//     dispatch(setTableData(dateFilterData));
//     dispatch(markPageLoadingAction(false));
//   }
// }

// export function doMongoQuery() {
//   return async (dispatch, _, {api}) => {
//     const query = await api.addFilters();
//     dispatch(queryMongo(query));
//   };
// }
