import {createAction} from 'redux-actions';

/**
 * Create an action with payload shaped like:
 *   {field: field to operate on, item: some value}
 */
function createItemAction(name) {
  return createAction(name, (field, item) => ({field, item}));
}

/**
 * User wants to start a new report.
 *
 * payload is an object shaped like {
 *   defaultFilter: start of currentFilter
 *   help: see report-action-reducer
 *   filters: see report-action-reducer
 * }
 */
export const startNewReportAction = createAction('START_NEW_REPORT');

/**
 * User set a value in a filter that is a simple value assignment.
 *
 * field: which filter field to operate on.
 * item: filter value
 */
export const setSimpleFilterAction = createItemAction('SET_SIMPLE_FILTER');

/**
 * User added a value to an or filter.
 *
 * field: which filter field to operate on.
 * item: filter value
 */
export const addToOrFilterAction = createItemAction('ADD_TO_OR_FILTER');

/**
 * User removed a value from an or filter.
 *
 * field: which filter field to operate on.
 * item: filter value
 */
export const removeFromOrFilterAction =
  createItemAction('REMOVE_FROM_OR_FILTER');

/**
 * User added a value to an and/or filter.
 *
 * field: which filter field to operate on.
 * index: which row of this field to operate on.
 * item: filter value
 */
export const addToAndOrFilterAction =
  createAction(
    'ADD_TO_AND_OR_FILTER',
    (field, index, item) => ({field, index, item}));

/**
 * User removed a value from an and/or filter.
 *
 * field: which filter field to operate on.
 * index: which row of this field to operate on.
 * item: filter value
 */
export const removeFromAndOrFilterAction =
  createAction(
    'REMOVE_FROM_AND_OR_FILTER',
    (field, index, item) => ({field, index, item}));

/**
 * User set a date range filter.
 *
 * field: which filter field to operate on.
 * item: filter value: [begin date, end date] both 'MM/DD/YYYY'
 */
export const addToDateRangeFilterAction = setSimpleFilterAction;

/**
 * User changed the name of the report.
 *
 * payload is the new report name
 */
export const setReportNameAction = createAction('SET_REPORT_NAME');
