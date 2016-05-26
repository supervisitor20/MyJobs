import {handleActions} from 'redux-actions';
import {map, filter as lodashFilter} from 'lodash-compat/collection';
import {omit} from 'lodash-compat/object';

const maxNameLength = 24;

function addOrReplaceByValue(items, item) {
  // Filter out the old thing, place the new one at the end.
  return [...lodashFilter(items, i => i.value !== item.value), item];
}

function replaceItemAtIndex(items, atIndex, newItem) {
  // Create a new array if the old one apparently didn't exist.
  if (!items) {
    return [newItem];
  }
  // If this is an unknown index, put the item at the end.
  if (!(atIndex in items)) {
    return [...items, newItem];
  }
  // Otherwise, replace the matching index.
  return map(items, (item, index) =>
    index === atIndex ? newItem : item);
}

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
 *  hints[key] = [{value: filter value, display user sees this}]
 *    last loaded hints available to the user for a field
 *    key: which field this applies to
 *    value: what to show the user and what it represents
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
      defaultFilter: currentFilter,
      help,
      filters: filterInterface,
      name: reportName,
    } = action.payload;
    return {
      currentFilter,
      help,
      reportName,
      filterInterface,
      errors: {},
      hints: {},
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
    };
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
    const cappedReportName = reportName.substring(0, maxNameLength);
    return {...state, reportName: cappedReportName};
  },

  'RECEIVE_HINTS': (state, action) => {
    const {field, hints} = action.payload;
    return {
      ...state,
      hints: {
        ...state.hints,
        [field]: hints,
      },
    };
  },

  'CLEAR_HINTS': (state, action) => {
    const field = action.payload;
    return {
      ...state,
      hints: omit(state.hints, (_, k) => k === field),
    };
  },
}, {
  currentFilter: {},
  filterInterface: [],
  reportName: '',
  hints: {},
});
