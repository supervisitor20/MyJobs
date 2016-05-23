import {handleActions, createAction} from 'redux-actions';
import {map, groupBy, filter as lodashFilter} from 'lodash-compat/collection';
import {findIndex} from 'lodash-compat/array';
import {omit} from 'lodash-compat/object';
import {isArray, isPlainObject, isString} from 'lodash-compat/lang';

/**
 * report filter state format: {
 *
 *  describes the controls present for selecting records for this report.
 *  filterInterface: [
 *    {
 *      filter: column filtered by this control; i.e. "contact"
 *      interfaceType: type of control to use; i.e. "date_range"
 *      display: display name for this control; i.e. "Contacts"
 *      FUTURE: add filterType to specify the type of filter data required
 *        i.e. "date_range", "or", "and_or", "string", etc.
 *    }
 *  ]
 *
 *  help[key] = boolean
 *    which controls have help available
 *    key: see filter in filterInterface
 *    boolean: true if help is available
 *
 *  currentFilter[key] = filterData
 *    items selected by the user, with display data
 *    key: see filter in filterInterface
 *    filterData: varies according to interfaceType
 *      date_range: [datestring, datestring] where datestring is "MM/DD/YYYY"
 *      city_state:
 *      {city: string or null, state: string or null}
 *      search_multiselect:
 *        [{value: filter value, display: user sees this}]
 *      tags:
 *        [[{value: filter value, display: user sees, hexColor: "xxxxxx"}]]
 *
 *  reportName: name of the currently configured report
 *
 *  errors[key] = [messages]
 *    errors in this report configuration
 *    key: see filter in filterInterface or "$ALL" for errors associated with
 *      no particular field. 'reportName' is served for the reportName control.
 *    messages: a list of strings, intended to be shown as a bulleted list.
 *
 * }
 */
export const reportStateReducer = handleActions({
  'START_NEW_REPORT': (state, action) => {
    const {
      default_filter: currentFilter,
      help,
      filters: filterInterface,
    } = action.payload;
    return {
      currentFilter,
      help,
      filterInterface,
      errors: {},
    };
  },

  'SET_SIMPLE_FILTER': (state, action) => {
    const {field, item} = action.payload;
    return {
      ...state,
      currentFilter: {
        ...state.currentFilter,
        [field]: item,
      },
    }
  },

  'ADD_TO_OR_FILTER': (state, action) => {
    const {field, item} = action.payload;
    const {currentFilter} = state;

    const orFilter = currentFilter[field] || [];
    const newOrFilter = addOrReplaceByValue(orFilter, item);
    return {
      ...state,
      currentFilter: {
        ...state.currentFilter,
        [field]: newOrFilter,
      },
    };
  },

  'REMOVE_FROM_OR_FILTER': (state, action) => {
    const {field, item} = action.payload;
    const {currentFilter} = state;

    if (!currentFilter.hasOwnProperty(field)) {
      return state;
    }
    const orFilter = currentFilter[field];
    const newOrFilter = lodashFilter(orFilter, i => i.value !== item.value);

    // If the group is empty, return the filter without this key.
    const newFilter = newOrFilter.length > 0 ? {
        ...currentFilter,
        [field]: newOrFilter,
      } : omit(currentFilter, (_, k) => k === field);

    return {
      ...state,
      currentFilter: newFilter,
    };
  },

  'ADD_TO_AND_OR_FILTER': (state, action) => {
    const {field, index, item} = action.payload;
    const {currentFilter} = state;

    const newFilter = replaceItemAtIndex(
      currentFilter[field],
      index,
      addOrReplaceByValue(
        (state.currentFilter[field] || [])[index],
        item));

    return {
      ...state,
      currentFilter: {
        ...currentFilter,
        [field]: newFilter,
      },
    };
  },

  'REMOVE_FROM_AND_OR_FILTER': (state, action) => {
    const {field, index, item} = action.payload;
    const {currentFilter} = state;

    const currentRow = (currentFilter[field] || [])[index] || [];

    if (!(index in currentFilter[field])) {
      return state;
    }

    const newRow = lodashFilter(currentRow, i => i.value !== item.value);

    let andGroup;
    if (newRow.length < 1) {
      andGroup = lodashFilter(currentFilter[field], (_, i) => i !== index);
    } else {
      andGroup = replaceItemAtIndex(
        state.currentFilter[field],
        index,
        newRow);
    }

    // If the group is empty, return the filter without this key.
    const newFilter = andGroup.length > 0 ? {
        ...currentFilter,
        [field]: andGroup,
      } : omit(currentFilter, (_, k) => k === field);

    return {
      ...state,
      currentFilter: newFilter,
    };
  },

  'SET_REPORT_NAME': (state, action) => {
    const reportName = action.payload;
    return {...state, reportName};
  },
});

function addOrReplaceByValue(items, item) {
  // Filter out the old thing, place the new one at the end.
  return [...lodashFilter(items, i => i.value !== item.value), item];
}

function replaceItemAtIndex(items, atIndex, newItem) {
  // Create a new array if the old one apparently didn't exist.
  if(!items) {
    return [newItem];
  }
  // If this is an unknown index, put the item at the end.
  if(!(atIndex in items)) {
    return [...items, newItem];
  }
  // Otherwise, replace the matching index.
  return map(items, (item, index) =>
    index === atIndex ? newItem : item);
}

function createItemAction(name) {
  return createAction(name, (field, item) => ({field, item}));
}

export const startNewReportAction = createAction('START_NEW_REPORT');

export const setSimpleFilterAction = createItemAction('SET_SIMPLE_FILTER');
export const addToOrFilterAction = createItemAction('ADD_TO_OR_FILTER');
export const removeFromOrFilterAction =
  createItemAction('REMOVE_FROM_OR_FILTER');

export const addToAndOrFilterAction =
  createAction(
    'ADD_TO_AND_OR_FILTER',
    (field, index, item) => ({field, index, item}));

export const removeFromAndOrFilterAction =
  createAction(
    'REMOVE_FROM_AND_OR_FILTER',
    (field, index, item) => ({field, index, item}));

export const addToDateRangeFilterAction = setSimpleFilterAction;

export const setReportNameAction = createAction('SET_REPORT_NAME');

export const startRunningReportAction = createAction('START_RUNNING_REPORT');
export const removeRunningReportAction = createAction('REMOVE_RUNNING_REPORT');
export const newReportAction = createAction('NEW_REPORT');

export function doRunReport(idGen, runReport, reportDataId, name, filter) {
  return async (dispatch, getState) => {
    const runningReportId = idGen.nextId();
    dispatch(startRunningReportAction(runningReportId));
    const response = await runReport(reportDataId, name, filter);
    dispatch(removeRunningReportAction(runningReportId));
    dispatch(newReportAction(response.id));
    // on error: note failed report
  }
}
