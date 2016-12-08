import {createAction} from 'redux-actions';

export const setDimensionData = createAction('SET_DIMENSION_DATA');

export function doGetPrimaryDimensionData() {
  return async (dispatch, _, {api}) => {
    const primaryDimensionData = await api.getPrimaryDimensionData();
    dispatch(setDimensionData(primaryDimensionData));
  };
}
