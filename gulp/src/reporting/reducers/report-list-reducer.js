import {handleActions} from 'redux-actions';
import {sortByAll, filter, map} from 'lodash-compat/collection';
import {findIndex} from 'lodash-compat/array';

export function sortReports(reports) {
  return sortByAll(reports, r => !r.isRunning, r => -r.order);
}

export function buildFullId(reportId, completed) {
  if (completed) {
    return 'completed-' + reportId;
  }
  return 'running-' + reportId;
}

/**
 * report list format: {
 *
 *   reports: [
 *     id: string, unique in this list i.e. 'completed-23', 'running-12'
 *     order: number, not neccessarily unique, used internally for sorting
 *       for completed reports, order is the same as the database id.
 *     name: report name
 *     report_type: used for old report preview
 *       i.e. "contacts", etc.
 *     isRunning: is this report running
 *     isRefreshing: is this report refreshing?
 *   ]
 *
 *   highlightId: integer or undefined. Which report should be highlighted
 *     right now?
 * }
 */
export default handleActions({
  'START_RUNNING_REPORT': (state, action) => {
    const {order, name} = action.payload;
    const id = buildFullId(order, false);
    const isRunning = true;
    const isRefreshing = false;
    const newRunningReport = {
      id,
      order,
      name,
      isRunning,
      isRefreshing,
      report_type: undefined,
    };
    return {
      ...state,
      reports: sortReports([
        ...state.reports,
        newRunningReport,
      ]),
    };
  },

  'START_REFRESHING_REPORT': (state, action) => {
    const order = action.payload;
    const id = buildFullId(order, true);
    const replaceIndex = findIndex(state.reports, r => r.id === id);
    if (replaceIndex === -1) {
      return state;
    }
    const refreshingReport = {
      ...state.reports[replaceIndex],
      isRefreshing: true,
    };
    const reportList = sortReports([
      ...filter(state.reports, (_, i) => i !== replaceIndex),
      refreshingReport,
    ]);
    return {
      ...state,
      reports: reportList,
    };
  },

  'REMOVE_RUNNING_REPORT': (state, action) => {
    const order = action.payload;
    const withoutGiven = filter(state.reports,
      i => i.order !== order || !i.isRunning);
    return {
      ...state,
      reports: withoutGiven,
    };
  },

  'REPLACE_REPORTS_LIST': (state, action) => {
    const reportList = action.payload;
    const runningOnly = filter(state.reports, r => r.isRunning);
    const newCompleted = map(reportList, r => ({
      id: buildFullId(r.id, true),
      order: r.id,
      name: r.name,
      isRunning: false,
      isRefreshing: false,
      report_type: r.report_type,
    }));
    return {
      ...state,
      reports: sortReports([...runningOnly, ...newCompleted]),
    };
  },

  'HIGHLIGHT_REPORT': (state, action) => {
    const reportId = action.payload;
    return {
      ...state,
      highlightId: reportId,
    };
  },
}, {
  reports: [],
  highlightId: undefined,
});
