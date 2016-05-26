import {forEach, includes} from 'lodash-compat/collection';

import {
  startRunningReportAction,
  removeRunningReportAction,
  completedReportsAction,
  newReportAction,
} from './report-list-actions';
import {
  receiveHintsAction,
  clearHintsAction,
} from './report-state-actions';

import {errorAction} from './error-actions';
import {is400Error, errorData} from '../common/myjobs-api';


/**
 * User ran a report.
 *
 * idGen: a id generator, used for temporary ids of unfinished reports.
 * api: api instance, used to run report and get the report list.
 * reportDataId: thekind of report to run
 * name: name of the report
 * filter: filter to use for running this report.
 */
export function doRunReport(reportDataId, name, filter) {
  return async (dispatch, _, {api, idGen}) => {
    const runningReportId = idGen.nextId();
    try {
      dispatch(startRunningReportAction(runningReportId));
      // Actually run report
      const newReport = await api.runReport(reportDataId, name, filter);
      dispatch(newReportAction(newReport.id));
      // Get a fresh report list.
      const reportList = await api.listReports();
      dispatch(completedReportsAction(reportList.reports));
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
 * User needs help with a filter field.
 *
 * api: api instance, used to call getHelp
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
        reportDataId, currentFilter, fieldName, partial);
      if (fieldName === 'state') {
        console.log('doGetHelp state', hints);
      }
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
    const newFilter = getState().reportState.currentFilter;
    // handle any of our known dependencies
    // FUTURE: stuff this in the database somehow.
    forEach(filterInterface, (item) => {
      if (item.filter === 'locations') {
        // FUTURE: locations hints should come via locations hint field.
        console.log('doUpdateFilterWithDependencies', 'get state hints');
        dispatch(doGetHelp(reportDataId, newFilter, 'state', ''));
      }
      if (includes(['contact', 'partner'], item.filter)) {
        dispatch(doGetHelp(reportDataId, newFilter, item.filter, ''));
      }
    });
  };
}
