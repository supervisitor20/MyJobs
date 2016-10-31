import {createAction} from 'redux-actions';

export const setChartDataAction = createAction('SET_JOBVIEW_CHART_DATA');

export function doGetChartData() {
  return async (dispatch, _, {api}) => {
    const rawChartData = await api.getViewsInWeek();
    dispatch(setChartDataAction(rawChartData));
  };
}
