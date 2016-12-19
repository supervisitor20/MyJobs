import {createAction} from 'redux-actions';
import {markNavLoadingAction} from '../../common/actions/loading-actions';

export const setSelectedFilterData = createAction('SET_SELECTED_FILTER_DATA');
export const storeActiveFilter = createAction('STORE_ACTIVE_FILTER');

/**
 * This action stores the active filters for sending back to the API in other request
 */
export function doStoreActiveFilter(type, value) {
  return async (dispatch) => {
    dispatch(storeActiveFilter({type: type, value: value}));
  };
}

/**
 * This action will get and set the current applied table filter when a filter is clicked inside of the table
 */
export function doGetSelectedFilterData(tableValue, typeValue) {
  return async (dispatch, getState, {api}) => {
    dispatch(markNavLoadingAction(true));
    dispatch(doStoreActiveFilter(typeValue, tableValue));
    // Storing the current filters inside of the state to send off in the request to the API
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
