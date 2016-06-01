import {map, forEach} from 'lodash-compat/collection';
import {zip, uniq} from 'lodash-compat/array';
import reportListReducer, {
  sortReports,
  buildFullId,
} from '../report-list-reducer';

import {
  startRunningReportAction,
  startRefreshingReportAction,
  removeRunningReportAction,
  replaceReportsListAction,
  highlightReportAction,
} from '../report-list-actions';


function makeReport(order, name, isRunning, {report_type, isRefreshing}) {
  return {
    id: buildFullId(order, !isRunning),
    order,
    name,
    isRunning: Boolean(isRunning),
    isRefreshing: Boolean(isRefreshing),
    report_type,
  };
}

// This improves messages on failed equality tests a bit.
const customMatchers = {
  toEqualReportList: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        const actualIds = map(actual, r => r.id);
        const expectedIds = map(expected, r => r.id);

        // Ids match
        expect(actualIds).toEqual(expectedIds);

        // elements match
        for(const [a, e] of zip(actual, expected)) {
          expect(a).toEqual(e);
        };

        return {pass: true};
      },
    };
  },
}

describe('sortReports', () => {
  beforeEach(() => {
    jasmine.addMatchers(customMatchers);
  });

  it('sorts by isRunning status, then by reverse order', () => {
    const input = [
      makeReport(2, 'two', false, {}),
      makeReport(7, 'seven', false, {}),
      makeReport(5, 'five', true, {}),
      makeReport(10, '10', true, {}),
    ];
    expect(sortReports(input)).toEqualReportList([
      makeReport(10, '10', true, {}),
      makeReport(5, 'five', true, {}),
      makeReport(7, 'seven', false, {}),
      makeReport(2, 'two', false, {}),
    ]);
  });
});

describe('reportListReducer', () => {
  beforeEach(() => {
    jasmine.addMatchers(customMatchers);
  });

  describe('defaultState', () => {
    const result = reportListReducer(undefined, {});
    it('has a reports list', () => {
      expect(result.reports).toEqual([]);
    });
  });

  describe('startRunningReportAction', () => {
    const action = startRunningReportAction({order: 4, name: 'four'});
    const result = reportListReducer({
      reports: [
        makeReport(3, 'three', true, {}),
        makeReport(5, 'five', true, {}),
        makeReport(2, 'two', false, {}),
      ],
    }, action);
    it('sorts the new running report into the reports list', () => {
      expect(result.reports).toEqualReportList([
        makeReport(5, 'five', true, {}),
        makeReport(4, 'four', true, {}),
        makeReport(3, 'three', true, {}),
        makeReport(2, 'two', false, {}),
      ]);
    });
  });

  describe('startRefreshingReportAction', () => {
    const previousState = {
      reports: [
        makeReport(3, 'three', true, {}),
        makeReport(5, 'five', true, {}),
        makeReport(2, 'two', false, {}),
      ],
    }
    it('sets the isRefreshing bit on the correct report', () => {
      const action = startRefreshingReportAction(2);
      const result = reportListReducer(previousState, action);
      expect(result.reports).toEqualReportList([
        makeReport(5, 'five', true, {}),
        makeReport(3, 'three', true, {}),
        makeReport(2, 'two', false, {isRefreshing: true}),
      ]);
    });
    it('leaves the state alone if the id does not exit', () => {
      const action = startRefreshingReportAction(99);
      const result = reportListReducer(previousState, action);
      expect(result).toEqualReportList(previousState);
    });
  });

  describe('removeRunningReportAction', () => {
    const action = removeRunningReportAction(4);
    const result = reportListReducer({
      reports: [
        makeReport(5, 'five', true, {}),
        makeReport(4, 'four', true, {}),
        makeReport(3, 'three', true, {}),
        makeReport(6, 'six', false, {}),
      ],
    }, action);
    it('removes a running report from the list', () => {
      expect(result.reports).toEqualReportList([
        makeReport(5, 'five', true, {}),
        makeReport(3, 'three', true, {}),
        makeReport(6, 'six', false, {}),
      ]);
    });
  });

  describe('replaceReportsListAction', () => {
    const action = replaceReportsListAction([
      {id: 1, name: 'one', report_type: 'partner'},
      {id: 2, name: 'two'},
    ]);
    const result = reportListReducer({
      reports: [
        makeReport(3, 'three', true, {}),
        makeReport(4, 'four', false, {}),
      ],
    }, action);
    it('replaces the list of completed reports', () => {
      expect(result.reports).toEqualReportList([
        makeReport(3, 'three', true, {}),
        makeReport(2, 'two', false, {}),
        makeReport(1, 'one', false, {report_type: 'partner'}),
      ]);
    });
  });

  describe('highlightReportAction', () => {
    it('replaces the highlighted id', () => {
      const action = highlightReportAction(2);
      const result = reportListReducer({}, action);
      expect(result.highlightId).toEqual(2);
    });
    it('allows setting to undefined', () => {
      const action = highlightReportAction();
      const result = reportListReducer({highlightId: 2}, action);
      expect(result.highlightId).not.toBeDefined();
    });
  });
});
