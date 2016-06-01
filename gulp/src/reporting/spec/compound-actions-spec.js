import {
  setSimpleFilterAction,
  receiveHintsAction,
  clearHintsAction,
} from '../report-state-actions';

import reportStateReducer from '../report-state-reducer';

import {
  startRunningReportAction,
  startRefreshingReportAction,
  removeRunningReportAction,
  replaceReportsListAction,
} from '../report-list-actions';

import {
  doRunReport,
  doRefreshReport,
  doGetHelp,
  doInitialLoad,
  getFilterValuesOnly,
  doUpdateFilterWithDependencies,
} from '../compound-actions';

import {
  errorAction,
  clearErrorsAction,
} from '../error-actions';

import {promiseTest} from '../../common/spec';
import IdGenerator from '../../common/id-generator';

import createReduxStore from '../../common/create-redux-store';
import {combineReducers} from 'redux';


class FakeApi {
  runReport() {}
  refreshReport() {}
  listReports() {}
  getHelp() {}
}


describe('doInitialLoad', () => {
  let actions;
  let api;

  beforeEach(() => {
    actions = [];
    api = new FakeApi();
  });

  function dispatch(action) {
    actions.push(action);
  }

  function getState() {
    return {};
  }

  it('loads the report list', promiseTest(async () => {
    spyOn(api, 'listReports').and.returnValue(Promise.resolve([
      {id: 3, name: 'c', report_type: 3},
      {id: 4, name: 'd', report_type: 4},
    ]));
    await doInitialLoad()(dispatch, getState, {api});
    expect(actions).toEqual([
      replaceReportsListAction([
        {id: 3, name: 'c', report_type: 3},
        {id: 4, name: 'd', report_type: 4},
      ]),
    ]);
  }));
});


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
    spyOn(api, 'listReports').and.returnValue(Promise.resolve([
      {id: 3, name: 'c', report_type: 3},
      {id: 4, name: 'd', report_type: 4},
    ]));
    const filter = {
      a: [{value: 1}],
    };

    await doRunReport(2, 'a', filter)(dispatch, getState, {idGen, api});
    expect(api.runReport).toHaveBeenCalledWith(2, 'a', {a: [1]});
    expect(api.listReports).toHaveBeenCalled();
    expect(actions).toEqual([
      clearErrorsAction(),
      startRunningReportAction({order: 1, name: 'a'}),
      replaceReportsListAction([
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
    await doRunReport(undefined, 'a')(dispatch, getState, {idGen, api});
    expect(actions).toEqual([
      clearErrorsAction(),
      startRunningReportAction({order: 1, name: 'a'}),
      removeRunningReportAction(1),
      errorAction("API Error", {some: 'data'}),
    ]);
  }));

  it('handles arbitrary failures', promiseTest(async () => {
    const error = new Error("Some Error");
    spyOn(api, 'runReport').and.throwError(error);
    await doRunReport(undefined, 'a')(dispatch, getState, {idGen, api});
    expect(actions).toEqual([
      clearErrorsAction(),
      startRunningReportAction({order: 1, name: 'a'}),
      removeRunningReportAction(1),
      errorAction("Some Error"),
    ]);
  }));
});


describe('doRefreshReport', () => {
  let actions;
  let api;

  beforeEach(() => {
    actions = [];
    api = new FakeApi();
  });

  function dispatch(action) {
    actions.push(action);
  }

  function getState() {
    return {};
  }

  it('handles the happy path', promiseTest(async () => {
    spyOn(api, 'refreshReport').and.returnValue(Promise.resolve({}));
    spyOn(api, 'listReports').and.returnValue(Promise.resolve([
      {id: 3, name: 'c', report_type: 3},
      {id: 4, name: 'd', report_type: 4},
    ]));

    await doRefreshReport(2)(dispatch, getState, {api});
    expect(api.refreshReport).toHaveBeenCalledWith(2);
    expect(api.listReports).toHaveBeenCalled();
    expect(actions).toEqual([
      startRefreshingReportAction(2),
      replaceReportsListAction([
        {id: 3, name: 'c', report_type: 3},
        {id: 4, name: 'd', report_type: 4},
      ]),
    ]);
  }));

  it('handles arbitrary failures', promiseTest(async () => {
    const error = new Error("Some Error");
    spyOn(api, 'refreshReport').and.throwError(error);
    await doRefreshReport(2)(dispatch, getState, {api});
    expect(actions).toEqual([
      startRefreshingReportAction(2),
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
