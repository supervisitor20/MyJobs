import {createAction} from 'redux-actions';

import {markNavLoadingAction} from '../../common/actions/loading-actions';

export const setSelectedFilterData = createAction('SET_SELECTED_FILTER_DATA');
export const storeActiveFilter = createAction('STORE_ACTIVE_FILTER');

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
