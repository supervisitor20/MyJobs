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
 *   name: starting name for this report
 * }
 */
export const startNewReportAction = createAction('START_NEW_REPORT');

/**
 * User set a value in a filter that is a simple value assignment.
 *
 * field: which filter field to operate on.
 * item: filter value
 */
export const setSimpleFilterAction =
  createItemAction(
    'SET_SIMPLE_FILTER',
    (field, item) => ({field, item}));

/**
 * User added a value to an or filter.
 *
 * field: which filter field to operate on.
 * items: filter value
 */
export const addToOrFilterAction =
  createAction(
    'ADD_TO_OR_FILTER',
    (field, items) => ({field, items}));

/**
 * User removed a value from an or filter.
 *
 * field: which filter field to operate on.
 * items: [filter values to remove]
 */
export const removeFromOrFilterAction =
  createAction(
    'REMOVE_FROM_OR_FILTER',
    (field, items) => ({field, items}));

/**
 * User added a value to an and/or filter.
 *
 * field: which filter field to operate on.
 * index: which row of this field to operate on.
 * items: filter value
 */
export const addToAndOrFilterAction =
  createAction(
    'ADD_TO_AND_OR_FILTER',
    (field, index, items) => ({field, index, items}));

/**
 * User removed a value from an and/or filter.
 *
 * field: which filter field to operate on.
 * index: which row of this field to operate on.
 * items: filter value
 */
export const removeFromAndOrFilterAction =
  createAction(
    'REMOVE_FROM_AND_OR_FILTER',
    (field, index, items) => ({field, index, items}));

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

/**
 * Api returned new hints.
 *
 * field: which filter field to operate on.
 * hints: may vary by filter type but is usually: [
 *   {value: some value, display: show to user, ...}
 * ]
 */
export const receiveHintsAction = createAction('RECEIVE_HINTS',
  (field, hints) => ({field, hints}));

/**
 * Need to clear all the known hints for a field.
 *
 * payload: string, which filter field to operate on.
 */
export const clearHintsAction = createAction('CLEAR_HINTS');
