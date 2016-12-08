import {createAction} from 'redux-actions';

import {markPageLoadingAction} from '../../common/actions/loading-actions';

export const setPrimaryDimensions = createAction('SET_PRIMARY_DIMENSIONS');

export function doGetPrimaryDimensions() {
  return async (dispatch, _, {api}) => {
    dispatch(markPageLoadingAction(true));
    const dimensionData = await api.getPrimaryDimensions();
    dispatch(setPrimaryDimensions(dimensionData));
    dispatch(markPageLoadingAction(false));
  };
}

export function switchMainDimension() {
  return {
    type: 'SWITCH_MAIN_DIMENSION',
  };
}
