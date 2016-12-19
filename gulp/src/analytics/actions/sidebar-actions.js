import {createAction} from 'redux-actions';

import {markPageLoadingAction} from '../../common/actions/loading-actions';
import {markNavLoadingAction} from '../../common/actions/loading-actions';

export const setPrimaryDimensions = createAction('SET_PRIMARY_DIMENSIONS');
export const switchMainDimension = createAction('SWITCH_MAIN_DIMENSION');
export const setMainDimension = createAction('SET_MAIN_DIMENSION');
export const storeActiveReport = createAction('STORE_ACTIVE_REPORT');

// Action for loading the initial primary dimensions
export function doGetPrimaryDimensions() {
  return async (dispatch, _, {api}) => {
    dispatch(markPageLoadingAction(true));
    const dimensionData = await api.getPrimaryDimensions();
    dispatch(setPrimaryDimensions(dimensionData));
    dispatch(markPageLoadingAction(false));
  };
}

// Action for switching the main dimensions from the sidebar
export function doSwitchMainDimension(mainDimension, start, end) {
  return async (dispatch, getState, {api}) => {
    dispatch(markNavLoadingAction(true));
    dispatch(storeActiveReport(mainDimension));
    const currentDimensionData = await api.getMainDimensionData(mainDimension, start, end);
    dispatch(switchMainDimension(currentDimensionData));
    dispatch(markNavLoadingAction(false));
    dispatch(setMainDimension(mainDimension));
  };
}
