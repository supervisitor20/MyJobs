import {createAction} from 'redux-actions';

export const setSelectedMonth = createAction('SET_SELECTED_MONTH');
export const setSelectedYear = createAction('SET_SELECTED_YEAR');

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
