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
  startNewReportAction,
  receiveHintsAction,
  clearHintsAction,
  removeFromOrFilterAction,
} from './report-state-actions';
import {
  replaceDataSetMenu,
} from './dataset-menu-actions';

import {errorAction, clearErrorsAction} from './error-actions';
import {is400Error, errorData} from '../common/myjobs-api';


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
 * Do the initial setup for the app.
 */
export function doInitialLoad() {
  return async (dispatch, getState, {api}) => {
    const reportList = await api.listReports();
    dispatch(replaceReportsListAction(reportList));
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
 * The user wants to clone a report.
 *
 * Set up history with reportDataId and defaultFilter. NAVIGATE to it.
 *
 * reportId: start with this reportId's filter instead of the default
 */
export function doSetUpForClone(history, reportId) {
  return async (dispatch, getState, {api}) => {
    const reportInfo = await api.getReportInfo(reportId);
    const locationState = {
      currentFilter: reportInfo.filter,
      name: 'Copy of ' + reportInfo.name,
    };
    const query = {
      reportDataId: reportInfo.report_data_id,
      intention: reportInfo.reporting_type,
      category: reportInfo.report_type,
      dataSet: reportInfo.data_type,
    };
    history.pushState(locationState, '/set-up-report', query);
  };
}

/**
 * The user changed the data set directly or via history.
 *
 * Figure out a valid configuration and reportDataId. NAVIGATE if needed.
 *
 * history: history object, in case we have to navigate
 * intention, category, dataSet: strings that together describe which report
 *   the user wants to run.
 * reportDataId: optional, the database id for the reportData previously in use
 * reportFilter: optional, prepopulate the filter
 * reportName: optional, use this name instead of a default name
 */
export function doReportDataSelect(history, intention, category, dataSet,
  reportDataId, reportFilter, reportName) {
  return async (dispatch, getState, {api}) => {
    const previousMenuState = getState().dataSetMenu;
    let newReportDataId;

    // First, do we need to refresh the menu items?
    if (previousMenuState &&
        intention && intention === previousMenuState.intentionValue &&
        category && category === previousMenuState.categoryValue &&
        dataSet && dataSet === previousMenuState.dataSetValue &&
        reportDataId && reportDataId === previousMenuState.reportDataId) {
      newReportDataId = reportDataId;
    } else {
      // We need to refresh the menu. Get some menu items.
      const menu = await api.getSetUpMenuChoices(
        intention || '',
        category || '',
        dataSet || '');

      // If we got a new reportDataId navigate there and stop for now.
      if (menu.report_data_id &&
          menu.report_data_id !== reportDataId) {
        history.pushState(null, '/set-up-report', {
          intention: menu.selected_reporting_type,
          category: menu.selected_report_type,
          dataSet: menu.selected_data_type,
          reportDataId: menu.report_data_id,
        });
        return;
      }
      dispatch(replaceDataSetMenu({
        intentionChoices: menu.reporting_types,
        categoryChoices: menu.report_types,
        dataSetChoices: menu.data_types,
        intentionValue: menu.selected_reporting_type,
        categoryValue: menu.selected_report_type,
        dataSetValue: menu.selected_data_type,
      }));
      newReportDataId = menu.report_data_id;
    }

    // If we haven't found a reportDataId stop. (Should never happen but
    // it's possible.)
    if (!newReportDataId) {
      return;
    }

    // Get the interface for this report.
    const filterInfo = await api.getFilters(newReportDataId);

    // Figure out the name for this report.
    let finalReportName;
    if (reportName) {
      finalReportName = reportName;
    } else {
      const defaultNameInfo = await api.getDefaultReportName(newReportDataId);
      finalReportName = defaultNameInfo.name;
    }

    // Figure out teh default filter.
    let finalDefaultFilter;
    if (reportFilter) {
      finalDefaultFilter = reportFilter;
    } else {
      finalDefaultFilter = filterInfo.default_filter;
    }

    // Go note it.
    dispatch(startNewReportAction({
      defaultFilter: finalDefaultFilter,
      help: filterInfo.help,
      filters: filterInfo.filters,
      name: finalReportName,
    }));

    // Ugly hack.
    // Preload hints for interface types that need it.
    await Promise.all(map(filterInfo.filters, async f => {
      let fieldName;
      if (f.interface_type === 'search_multiselect' ||
          f.interface_type === 'tags') {
        fieldName = f.filter;
      } else if (f.interface_type === 'city_state') {
        fieldName = 'state';
      }

      if (fieldName) {
        await dispatch(
          doGetHelp(newReportDataId, finalDefaultFilter, fieldName, ''));
      }
    }));
  };
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
