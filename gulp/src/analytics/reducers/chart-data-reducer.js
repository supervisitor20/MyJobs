import {handleActions} from 'redux-actions';

export const initialChartData = {
  'JobViewsChartData': [],
};

export default handleActions({
  'SET_JOBVIEW_CHART_DATA': (state, action) => {
    return {
      ...state,
      'JobViewsChartData': action.payload,
    }
  }
}, initialChartData);
