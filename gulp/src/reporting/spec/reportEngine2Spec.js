import {
  startNewReportAction,
  setSimpleFilterAction,
  addToOrFilterAction,
  removeFromOrFilterAction,
  addToAndOrFilterAction,
  removeFromAndOrFilterAction,
  setReportNameAction,
} from '../report-state-actions';

import {
  reportStateReducer,
} from '../report-state-reducer';

import {
  startRunningReportAction,
  removeRunningReportAction,
  completedReportsAction,
  newReportAction,
} from '../report-list-actions';

import {
  doRunReport,
} from '../compound-actions';

import {
  errorAction,
} from '../error-actions';

import {promiseTest} from '../../common/spec';
import IdGenerator from '../../common/idGenerator';

describe('reportStateReducer', () => {
  describe('default state', () => {
    const result = reportStateReducer(undefined, {});
    it('has a current filter', () => {
      expect(result.currentFilter).toEqual({});
    });
    it('has a filter interface', () => {
      expect(result.filterInterface).toEqual([]);
    });
    it('has a name', () => {
      expect(result.reportName).toEqual('');
    });
  });

  describe('startNewReportAction', () => {
    const action = startNewReportAction({
      defaultFilter: {1: 2},
      help: {3: 4},
      filters: {5: 6},
    });
    const result = reportStateReducer(null, action);
    it('puts data where it goes', () => {
      expect(result).toEqual({
        filterInterface: {5: 6},
        help: {3: 4},
        currentFilter: {1: 2},
        errors: {},
      });
    });
  });

  it('can merge a scalar filter', () => {
    const action = setSimpleFilterAction("city", {value: 2, display: "Clay"});
    const result = reportStateReducer({currentFilter: {}}, action);
    expect(result.currentFilter).toEqual({
      city: {value: 2, display: "Clay"},
    });
  });

  it('can add to an or filter', () => {
    const action = addToOrFilterAction("contact", {value: 3, display: "Bob"});
    const result = reportStateReducer({
      currentFilter: {
        "contact": [
          {value: 4, display: "Ann"},
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "contact": [
        {value: 4, display: "Ann"},
        {value: 3, display: "Bob"},
      ],
    });
  });

  it('can add to an or filter if that filter does not yet exist', () => {
    const action = addToOrFilterAction("contact", {value: 3, display: "Bob"});
    const result = reportStateReducer({currentFilter: {}}, action);
    expect(result.currentFilter).toEqual({
      "contact": [
        {value: 3, display: "Bob"},
      ],
    });
  });

  it('can overwrite a value by adding to an or filter', () => {
    const action = addToOrFilterAction("contact", {value: 3, display: "Bob"});
    const result = reportStateReducer({
      currentFilter: {
        "contact": [
          {value: 3, display: "Dan"},
          {value: 4, display: "Ann"},
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "contact": [
        {value: 4, display: "Ann"},
        {value: 3, display: "Bob"},
      ],
    });
  });

  it('can remove a value from an or filter', () => {
    const action = removeFromOrFilterAction(
      "contact", {value: 3, display: "Bob"});
    const result = reportStateReducer({
      currentFilter: {
        "contact": [
          {value: 3, display: "Bob"},
          {value: 4, display: "Ann"},
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "contact": [
        {value: 4, display: "Ann"},
      ],
    });
  });

  it('can leave an or filter untouched when removing ' +
      'an item that is not there.', () => {
    const action = removeFromOrFilterAction(
      "contact", {value: 3, display: "Bob"});
    const result = reportStateReducer({
      currentFilter: {
        "contact": [
          {value: 4, display: "Ann"},
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "contact": [
        {value: 4, display: "Ann"},
      ],
    });
  });

  it('can ignore removing an item from a mising filter', () => {
    const action = removeFromOrFilterAction(
      "contact", {value: 3, display: "Bob"});
    const result = reportStateReducer({currentFilter: {}}, action);
    expect(result.currentFilter).toEqual({});
  });

  it('automatically deletes an empty or filter after remove', () => {
    const action = removeFromOrFilterAction(
      "contact", {value: 3, display: "Bob"});
    const result = reportStateReducer({
      currentFilter: {
        "contact": [
          {value: 3, display: "Whatever"},
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({});
  });

  it('can add an item to an and/or filter', () => {
    const action = addToAndOrFilterAction(
      "tags", 0, {value: 3, display: "Test"});
    const result = reportStateReducer({
      currentFilter: {
        "tags": [[]],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "tags": [
        [
          {value: 3, display: "Test"},
        ],
      ],
    });
  });

  it('can add an item to an and/or filter if the filter did not exist', () => {
    const action = addToAndOrFilterAction(
      "tags", 10, {value: 3, display: "Test"});
    const result = reportStateReducer({currentFilter: {}}, action);
    expect(result.currentFilter).toEqual({
      "tags": [
        [
          {value: 3, display: "Test"},
        ],
      ],
    });
  });

  it('can add an item to an and/or filter if the row did not exist', () => {
    const action = addToAndOrFilterAction(
      "tags", 10, {value: 3, display: "Test"});
    const result = reportStateReducer({
      currentFilter: {
        "tags": [
          [
            {value: 1, display: "Red"},
          ],
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "tags": [
        [
          {value: 1, display: "Red"},
        ],
        [
          {value: 3, display: "Test"},
        ],
      ],
    });
  });

  it('can remove an item from an and/or filter', () => {
    const action = removeFromAndOrFilterAction(
      "tags", 0, {value: 3, display: "Test"});
    const result = reportStateReducer({
      currentFilter: {
        "tags": [
          [
            {value: 3, display: "Test"},
            {value: 1, display: "Red"},
          ],
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "tags": [
        [
          {value: 1, display: "Red"},
        ],
      ],
    });
  })

  it('can leave an and/or filter untouched when removing ' +
      'an item that is not there.', () => {
    const action = removeFromAndOrFilterAction(
      "tags", 0, {value: 3, display: "Test"});
    const result = reportStateReducer({
      currentFilter: {
        "tags": [
          [
            {value: 1, display: "Red"},
          ],
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "tags": [
        [
          {value: 1, display: "Red"},
        ],
      ],
    });
  });

  it('can leave an and/or filter untouched when removing ' +
      'from a row that is not there.', () => {
    const action = removeFromAndOrFilterAction(
      "tags", 10, {value: 3, display: "Test"});
    const result = reportStateReducer({
      currentFilter: {
        "tags": [
          [
            {value: 1, display: "Red"},
          ],
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "tags": [
        [
          {value: 1, display: "Red"},
        ],
      ],
    });
  });

  it('automatically deletes an empty and/or row after remove', () => {
    const action = removeFromAndOrFilterAction(
      "tags", 0, {value: 3, display: "Test"});
    const result = reportStateReducer({
      currentFilter: {
        "tags": [
          [
            {value: 3, display: "Test"},
          ],
          [
            {value: 1, display: "Red"},
          ],
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({
      "tags": [
        [
          {value: 1, display: "Red"},
        ],
      ],
    });
  });

  it('automatically deletes an empty and/or filter after remove', () => {
    const action = removeFromAndOrFilterAction(
      "tags", 0, {value: 3, display: "Test"});
    const result = reportStateReducer({
      currentFilter: {
        "tags": [
          [
            {value: 3, display: "Test"},
          ],
        ],
      },
    }, action);
    expect(result.currentFilter).toEqual({});
  });

  it('can set the report name', () => {
    const action = setReportNameAction("Contacts 2016");
    const result = reportStateReducer({}, action);
    expect(result.reportName).toEqual("Contacts 2016");
  });

  it('caps the report name at 24 characters', () => {
    const action = setReportNameAction("123456789012345678901234567890");
    const result = reportStateReducer({}, action);
    expect(result.reportName).toEqual("123456789012345678901234");
  });
});


class FakeApi {
  runReport(reportDataId, name, filter) {}
  listReports() {}
}


describe('doRunReport', () => {
  let actions;
  let state;
  let idGen;
  let api;

  beforeEach(() => {
    actions = [];
    state = {};
    idGen = new IdGenerator();
    api = new FakeApi();
  });

  function dispatch(action) {
    actions.push(action);
  }

  function getState() {
    return state;
  }

  it('handles the happy path', promiseTest(async () => {
    spyOn(api, 'runReport').and.returnValue(Promise.resolve({id: 99}));
    spyOn(api, 'listReports').and.returnValue(Promise.resolve({
      reports: [
        {id: 3, name: 'c', report_type: 3},
        {id: 4, name: 'd', report_type: 4},
      ],
    }));
    await doRunReport(
      idGen,
      api,
      2,
      'a',
      {1: 2})(
      dispatch,
      getState);
    expect(api.runReport).toHaveBeenCalledWith(2, 'a', {1: 2});
    expect(api.listReports).toHaveBeenCalled();
    expect(actions).toEqual([
      startRunningReportAction(1),
      newReportAction(99),
      completedReportsAction([
        {id: 3, name: 'c', report_type: 3},
        {id: 4, name: 'd', report_type: 4},
      ]),
      removeRunningReportAction(1),
    ]);
  }));

  it('handles api failures', promiseTest(async () => {
    const error = new Error("API Error");
    error.data = {some: 'data'};
    error.response = {
      status: 400,
    };
    spyOn(api, 'runReport').and.throwError(error);
    await doRunReport(idGen, api)(dispatch, getState);
    expect(actions).toEqual([
      startRunningReportAction(1),
      removeRunningReportAction(1),
      errorAction("API Error", {some: 'data'}),
    ]);
  }));

  it('handles arbitrary failures', promiseTest(async () => {
    const error = new Error("Some Error");
    spyOn(api, 'runReport').and.throwError(error);
    await doRunReport(idGen, api)(dispatch, getState);
    expect(actions).toEqual([
      startRunningReportAction(1),
      removeRunningReportAction(1),
      errorAction("Some Error"),
    ]);
  }));
});
