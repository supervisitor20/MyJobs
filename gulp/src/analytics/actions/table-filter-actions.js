import {createAction} from 'redux-actions';

import {markPageLoadingAction} from '../../common/actions/loading-actions';
import {markNavLoadingAction} from '../../common/actions/loading-actions';

export const setPageData = createAction('SET_PAGE_DATA');
export const setPrimaryDimensions = createAction('SET_PRIMARY_DIMENSIONS');
export const setSelectedFilterData = createAction('SET_SELECTED_FILTER_DATA');
export const storeActiveFilter = createAction('STORE_ACTIVE_FILTER');
export const storeInitialReport = createAction('STORE_INITIAL_REPORT');

// Function to set the default loading data for the analytics page
export function doGetPageData(start, end) {
  return async (dispatch, _, {api}) => {
    dispatch(markPageLoadingAction(true));
    const rawPageData = await api.getInitialPageData(start, end);
    const dimensionData = await api.getPrimaryDimensions();
    const reportType = await api.getStartingPointReport();
    dispatch(setPageData(rawPageData));
    dispatch(setPrimaryDimensions(dimensionData));
    dispatch(storeInitialReport(reportType));
    dispatch(markPageLoadingAction(false));
  };
}

// Function for storing the active filters for the API
export function doStoreActiveFilter(type, value) {
  return async (dispatch) => {
    dispatch(storeActiveFilter({type: type, value: value}));
  };
}

// Function for setting the current applied table filter data to the tab
export function doGetSelectedFilterData(tableValue, typeValue) {
  return async (dispatch, getState, {api}) => {
    dispatch(markNavLoadingAction(true));
    dispatch(doStoreActiveFilter(typeValue, tableValue));
    const storedFilters = [];
    getState().pageLoadData.activeFilters.map((filter) => {
      storedFilters.push(filter);
    });
    const currentReport = getState().pageLoadData.activeReport;
    const selectedFilterData = await api.getSelectedFilterData(tableValue, typeValue, storedFilters, currentReport);
    dispatch(setSelectedFilterData(selectedFilterData));
    dispatch(markNavLoadingAction(false));
  };
}
