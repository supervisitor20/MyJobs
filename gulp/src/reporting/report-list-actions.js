import {createAction} from 'redux-actions';


/**
 * A report started running.
 *
 * payload is an object shaped like:
 *   {
 *     order: sort order integer for this report. Should be unique within the
 *       order numbers for running reports.
 *     name: report name,
 *   }
 */
export const startRunningReportAction = createAction('START_RUNNING_REPORT');

/**
 * A running report has finished
 *
 * payload is the numeric order id for this running report.
 */
export const removeRunningReportAction = createAction('REMOVE_RUNNING_REPORT');

/**
 * We have a new list of completed reports.
 *
 * payload is a list of:
 *   {order: database id, name: report name, report_data_id: report data id}
 */
export const replaceReportsListAction = createAction('REPLACE_REPORTS_LIST');

/**
 * The currently highlighted report has changed for some reason.
 *
 * payload is an integer representing the report id or undefined if no report
 * should be highlighted.
 */
export const highlightReportAction = createAction('HIGHLIGHT_REPORT');

/**
 * A report started running.
 *
 * payload is an object shaped like:
 *   {
 *     id: unique id for this running report,
 *     name: report name,
 *   }
 */
export const startRefreshingReportAction =
  createAction('START_REFRESHING_REPORT');
