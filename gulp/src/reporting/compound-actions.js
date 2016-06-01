import warning from 'warning';
import {mapValues} from 'lodash-compat/object';
import {isArray, isPlainObject, isString} from 'lodash-compat/lang';
import {
  indexBy,
  map,
  forEach,
  find,
  filter as lodashFilter,
} from 'lodash-compat/collection';

import {
  startRunningReportAction,
  startRefreshingReportAction,
  removeRunningReportAction,
  replaceReportsListAction,
} from './report-list-actions';
import {
  receiveHintsAction,
  clearHintsAction,
  removeFromOrFilterAction,
} from './report-state-actions';

import {errorAction, clearErrorsAction} from './error-actions';
import {is400Error, errorData} from '../common/myjobs-api';


/**
 * Do the initial setup for the app.
 */
export function doInitialLoad() {
  return async (dispatch, getState, {api}) => {
    const reportList = await api.listReports();
    dispatch(replaceReportsListAction(reportList));
  };
}

/**
 * Build a filter suitable for sending to the run method of the api.
 *
 * Run and hints methods want any objects like {value: x, ...}
 * transformed down to just x.
 */
export function getFilterValuesOnly(currentFilter) {
  // FUTURE: add filterType to specify the type of filter data required
  //  i.e. "date_range", "or", "and_or", "string", etc.
  //  This will make this function need to do less guessing.
  const result = mapValues(currentFilter, item => {
    if (isString(item) || isPlainObject(item)) {
      return item;
    } else if (isArray(item) && isPlainObject(item[0])) {
      return map(item, o => o.value);
    } else if (isArray(item) && isArray(item[0])) {
      return map(item, inner => map(inner, o => o.value));
    } else if (isArray(item) && item.length === 2 &&
        // Looks like a date range.
        typeof(item[0]) === 'string' && typeof(item[1]) === 'string') {
      return item;
    }
    warning(false, 'Unrecognized filter type: ' + JSON.stringify(item));
  });
  return result;
}

/**
 * User ran a report.
 *
 * reportDataId: thekind of report to run
 * name: name of the report
 * filter: filter to use for running this report.
 */
export function doRunReport(reportDataId, name, filter) {
  return async (dispatch, _, {api, idGen}) => {
    const runningReportId = idGen.nextId();
    try {
      dispatch(clearErrorsAction());
      dispatch(startRunningReportAction({order: runningReportId, name: name}));
      // Actually run report
      await api.runReport(reportDataId, name, getFilterValuesOnly(filter));
      // Get a fresh report list.
      const reportList = await api.listReports();
      dispatch(replaceReportsListAction(reportList));
      dispatch(removeRunningReportAction(runningReportId));
    } catch (exc) {
      dispatch(removeRunningReportAction(runningReportId));
      if (is400Error(exc)) {
        dispatch(errorAction(exc.message, errorData(exc)));
      } else {
        dispatch(errorAction(exc.message));
      }
    }
  };
}


/**
 * User refreshed a report.
 *
 * reportId: id of report to refresh
 */
export function doRefreshReport(reportId) {
  return async (dispatch, _, {api}) => {
    try {
      dispatch(startRefreshingReportAction(reportId));
      await api.refreshReport(reportId);
      const reportList = await api.listReports();
      dispatch(replaceReportsListAction(reportList));
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}


/**
 * User needs help with a filter field.
 *
 * reportDataId: which kind of report is this?
 * currentFilter: the filter the user constructed so far
 * fieldName: field the user is operating on
 * partial: input in the field so far. Can be a blank string which the api
 *   should interpret as "tell me about all possible options".
 */
export function doGetHelp(reportDataId, currentFilter, fieldName, partial) {
  return async (dispatch, _, {api}) => {
    try {
      // FUTURE: add some loading indicator actions.
      dispatch(clearHintsAction(fieldName));
      const hints = await api.getHelp(
        reportDataId, getFilterValuesOnly(currentFilter), fieldName, partial);
      dispatch(receiveHintsAction(fieldName, hints));
    } catch (exc) {
      dispatch(errorAction(exc.message));
    }
  };
}


/**
 * User updated a filter, need to update various dependent fields.
 *
 * Some ugly hacks live here.
 *
 * action: some filter updating action
 * filterInterface: interface used at filter time
 */
export function doUpdateFilterWithDependencies(
  action, filterInterface, reportDataId) {
  return async (dispatch, getState) => {
    // first do the change
    dispatch(action);

    function latestFilter() {
      return getState().reportState.currentFilter;
    }
    // get the filter that resulted from the change

    // FUTURE: declare all of this in the database somehow.
    if (find(filterInterface, i => i.filter === 'partner')) {
      await dispatch(doGetHelp(reportDataId, latestFilter(), 'partner', ''));
    }
    if (find(filterInterface, i => i.filter === 'contact')) {
      await dispatch(doGetHelp(reportDataId, latestFilter(), 'contact', ''));
      // Ugly hack: remove elements from the contact filter if they are
      // not in hints.
      const availableValues = indexBy(
        getState().reportState.hints.contact,
        'value');
      const selected = latestFilter().contact;
      const missingSelected =
        lodashFilter(selected, s => !availableValues[s.value]);
      forEach(missingSelected, s =>
        dispatch(removeFromOrFilterAction('contact', s)));
    }
    if (find(filterInterface, i => i.filter === 'locations')) {
      await dispatch(doGetHelp(reportDataId, latestFilter(), 'state', ''));
    }
  };
}
