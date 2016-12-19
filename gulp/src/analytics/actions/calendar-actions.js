import {createAction} from 'redux-actions';

import {markNavLoadingAction} from '../../common/actions/loading-actions';

export const setSelectedMonth = createAction('SET_SELECTED_MONTH');
export const setSelectedYear = createAction('SET_SELECTED_YEAR');
export const setSelectedDay = createAction('SET_SELECTED_DAY');
export const setSelectedRange = createAction('SET_SELECTED_RANGE');

// Sets the current month selected for the calendar
export function doSetSelectedMonth(month) {
  return async(dispatch) => {
    const currentMonth = month;
    dispatch(setSelectedMonth(currentMonth));
  };
}
// Sets the selected year for the calendar
export function doSetSelectedYear(year) {
  return async(dispatch) => {
    const currentYear = year;
    dispatch(setSelectedYear(currentYear));
  };
}
// Sets the selected day for the calendar
export function doSetSelectedDay(day) {
  return async(dispatch) => {
    const currentDay = day.day;
    dispatch(setSelectedDay(currentDay));
  };
}
// Sets the selected range for the calendar
export function doSetSelectedRange(start, end, mainDimension, activeFilters) {
  return async(dispatch, _, {api}) => {
    dispatch(markNavLoadingAction(true));
    const currentStartRange = start;
    const currentEndRange = end;
    const currentDimension = mainDimension;
    const currentFilters = activeFilters;
    const rangeData = await api.getDateRangeData(currentStartRange, currentEndRange, currentDimension, currentFilters);
    dispatch(setSelectedRange(rangeData));
    dispatch(markNavLoadingAction(false));
  };
}
