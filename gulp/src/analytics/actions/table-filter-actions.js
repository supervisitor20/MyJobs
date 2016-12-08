import {createAction} from 'redux-actions';

import {markPageLoadingAction} from '../../common/actions/loading-actions';

export const setPageData = createAction('SET_PAGE_DATA');
export const setPrimaryDimensions = createAction('SET_PRIMARY_DIMENSIONS');
export const setSelectedFilterData = createAction('SET_SELECTED_FILTER_DATA');

// Function to set the default loading data for the analytics page
export function doGetPageData(start, end) {
  return async (dispatch, _, {api}) => {
    dispatch(markPageLoadingAction(true));
    const rawPageData = await api.getInitialPageData(start, end);
    const dimensionData = await api.getPrimaryDimensions();
    dispatch(setPrimaryDimensions(dimensionData));
    dispatch(setPageData(rawPageData));
    dispatch(markPageLoadingAction(false));
  };
}

export function doGetSelectedFilterData() {
  return async (dispatch, _, {api}) => {
    dispatch(markPageLoadingAction(true));
    const selectedFilterData = await api.getSelectedFilterData();
    dispatch(setSelectedFilterData(selectedFilterData));
    dispatch(markPageLoadingAction(false));
  };
}

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
