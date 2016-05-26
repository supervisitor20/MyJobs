import {
  startNewReportAction,
  setSimpleFilterAction,
  addToOrFilterAction,
  removeFromOrFilterAction,
  addToAndOrFilterAction,
  removeFromAndOrFilterAction,
  setReportNameAction,
  receiveHintsAction,
  clearHintsAction,
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
  doGetHelp,
  getFilterValuesOnly,
  doUpdateFilterWithDependencies,
} from '../compound-actions';

import {
  errorAction,
} from '../error-actions';

import {promiseTest} from '../../common/spec';
import IdGenerator from '../../common/idGenerator';

import createReduxStore from '../../common/create-redux-store';
import {combineReducers} from 'redux';


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
    it('has hints', () => {
      expect(result.hints).toEqual({});
    });
  });

  describe('startNewReportAction', () => {
    const action = startNewReportAction({
      defaultFilter: {1: 2},
      help: {3: 4},
      filters: {5: 6},
      name: 'zz',
    });
    const result = reportStateReducer(null, action);
    it('puts data where it goes', () => {
      expect(result).toEqual({
        filterInterface: {5: 6},
        help: {3: 4},
        currentFilter: {1: 2},
        errors: {},
        hints: {},
        reportName: 'zz',
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

  it('can receive hints', () => {
    const action = receiveHintsAction("city", [{value: 3, display: "Indy"}]);
    const result = reportStateReducer({
      hints: {},
    }, action);
    expect(result.hints).toEqual({city: [{value: 3, display: "Indy"}]});
  });

  it('can clear hints', () => {
    const action = clearHintsAction("city");
    const result= reportStateReducer({
      hints: {
        city: [1, 2, 3],
      },
    }, action);
    expect(result.hints).toEqual({});
  });
});


class FakeApi {
  runReport(reportDataId, name, filter) {}
  listReports() {}
  getHelp() {}
}


describe('doRunReport', () => {
  let actions;
  let idGen;
  let api;

  beforeEach(() => {
    actions = [];
    idGen = new IdGenerator();
    api = new FakeApi();
  });

  function dispatch(action) {
    actions.push(action);
  }

  function getState() {
    return {};
  }

  it('handles the happy path', promiseTest(async () => {
    spyOn(api, 'runReport').and.returnValue(Promise.resolve({id: 99}));
    spyOn(api, 'listReports').and.returnValue(Promise.resolve({
      reports: [
        {id: 3, name: 'c', report_type: 3},
        {id: 4, name: 'd', report_type: 4},
      ],
    }));
    await doRunReport(2, 'a', {1: 2})(dispatch, getState, {idGen, api});
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
    await doRunReport()(dispatch, getState, {idGen, api});
    expect(actions).toEqual([
      startRunningReportAction(1),
      removeRunningReportAction(1),
      errorAction("API Error", {some: 'data'}),
    ]);
  }));

  it('handles arbitrary failures', promiseTest(async () => {
    const error = new Error("Some Error");
    spyOn(api, 'runReport').and.throwError(error);
    await doRunReport()(dispatch, getState, {idGen, api});
    expect(actions).toEqual([
      startRunningReportAction(1),
      removeRunningReportAction(1),
      errorAction("Some Error"),
    ]);
  }));
});


describe('doGetHints', () => {
  let actions;
  let idGen;
  let api;

  beforeEach(() => {
    actions = [];
    idGen = new IdGenerator();
    api = new FakeApi();
  });

  function dispatch(action) {
    actions.push(action);
  }

  function getState() {
    return {};
  }

  it('handles the happy path', promiseTest(async () => {
    spyOn(api, 'getHelp').and.returnValue(Promise.resolve([
      {value: 3, display: 'Red'},
      {value: 4, display: 'Blue'},
    ]));
    const filter = {
      a: [{value: 1}],
    }
    await doGetHelp(9, filter, 'labels', 'z')(dispatch, getState, {api});
    expect(api.getHelp).toHaveBeenCalledWith(9, {a: [1]}, 'labels', 'z');
    expect(actions).toEqual([
      clearHintsAction('labels'),
      receiveHintsAction('labels', [
        {value: 3, display: 'Red'},
        {value: 4, display: 'Blue'},
      ]),
    ]);
  }));

  it('handles arbitrary failures', promiseTest(async () => {
    const error = new Error("Some Error");
    spyOn(api, 'getHelp').and.throwError(error);
    await doGetHelp(9, {}, 'labels')(dispatch, getState, {api});
    expect(actions).toEqual([
      clearHintsAction('labels'),
      errorAction("Some Error"),
    ]);
  }));
});


describe('getFilterValuesOnly', () => {
  it('returns strings and plain objects unchanged', () => {
    const filter = {a: 'b', c: {d: 'e'}};
    expect(getFilterValuesOnly(filter)).toEqual(filter);
  });

  it('returns date ranges unchanged', () => {
    const filter = {a: ['11/11/1111', '12/22/2222']};
    expect(getFilterValuesOnly(filter)).toEqual(filter);
  });

  it('returns or filters stripped down to their values', () => {
    const filter = {a: [{value: 1}]};
    expect(getFilterValuesOnly(filter)).toEqual({a: [1]});
  });

  it('returns and/or filters stripped down to their values', () => {
    const filter = {a: [[{value: 1}]]};
    expect(getFilterValuesOnly(filter)).toEqual({a: [[1]]});
  });
});


describe('doUpdateFilterWithDependencies end to end', () => {
  let actions;
  let idGen;
  let api;
  let store;
  let newReportState;
  let oldReportState;

  const defaultState = {
    reportState: {
      filterInterface: [
        {filter: 'locations'},
        {filter: 'contact'},
        {filter: 'partner'},
      ],

      currentFilter: {
        'locations': {city: 'Indy', state: 'IN'},
        'contact': [
          {value: 3},
          {value: 4},
        ],
        'partner': [
          {value: 5},
          {value: 6},
        ],
      },
    },
  };

  beforeEach(promiseTest(async () => {
    actions = [];
    idGen = new IdGenerator();
    api = new FakeApi();

    spyOn(api, 'getHelp').and.callFake((_r, _f, field) => {
      switch(field) {
        case 'state':
          return Promise.resolve([{value: 'CA'}]);
        case 'partner':
          return Promise.resolve([{value: 5}]);
        case 'contact':
          return Promise.resolve([{value: 3}]);
      }
    });

    store = createReduxStore(
      combineReducers({reportState: reportStateReducer}),
      defaultState,
      {api, idGen});

    await doUpdateFilterWithDependencies(
      setSimpleFilterAction('locations', {city: 'Indy2', state: 'IN'}),
      defaultState.reportState.filterInterface,
      0)(
      (...args) => store.dispatch(...args),
      (...args) => store.getState(...args),
      {api, idGen});

    newReportState = store.getState().reportState;
    oldReportState = defaultState.reportState;
  }));

  it('has the expected hints', promiseTest(async () => {
    expect(newReportState.hints).toEqual({
      state: [{value: 'CA'}],
      partner: [{value: 5}],
      contact: [{value: 3}],
    });
  }));

  it('has the expected filterInterface', promiseTest(async () => {
    expect(newReportState.filterInterface)
      .toEqual(oldReportState.filterInterface);
  }));

  it('has the expected currentFilter', promiseTest(async () => {
    expect(newReportState.currentFilter).toEqual({
      ...oldReportState.currentFilter,
      locations: {city: 'Indy2', state: 'IN'},
      contact: [{value: 3}],
    });
  }));
});
