import {
  startRunningReportAction,
  removeRunningReportAction,
  completedReportsAction,
  newReportAction,
} from './report-list-actions';
import {errorAction} from './error-actions';
import {is500Error, is400Error, errorData} from '../common/myjobs-api';

/**
 * User ran a report.
 *
 * idGen: a id generator, used for temporary ids of unfinished reports.
 * api: api instance, used to run report and get the report list.
 * reportDataId: thekind of report to run
 * name: name of the report
 * filter: filter to use for running this report.
 */
export function doRunReport(idGen, api, reportDataId, name, filter) {
  return async (dispatch, getState) => {
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
  }
}


