import {createAction} from 'redux-actions';

/**
 * A report started running.
 *
 * payload is the numeric id for this running report.
 */
export const startRunningReportAction = createAction('START_RUNNING_REPORT');

/**
 * A running report has finished
 *
 * payload is the numeric id for this running report.
 */
export const removeRunningReportAction = createAction('REMOVE_RUNNING_REPORT');

/**
 * A report completed running.
 *
 * payload is the read database id for this new running report.
 */
export const newReportAction = createAction('NEW_REPORT');

/**
 * We have a new list of completed reports.
 *
 * payload is a list of:
 *   {id: database id, name: report name, report_data_id: report data id}
 */
export const completedReportsAction = createAction('COMPLETED_REPORTS_LIST');

