import {
  reportStateReducer,
  startNewReportAction,
  setSimpleFilterAction,
  addToOrFilterAction,
  removeFromOrFilterAction,
  addToAndOrFilterAction,
  removeFromAndOrFilterAction,
  setReportNameAction,
  doRunReport,
  startRunningReportAction,
  removeRunningReportAction,
  newReportAction,
} from '../reportEngine2';

import {promiseTest} from '../../common/spec';
import IdGenerator from '../../common/idGenerator';

describe('reportStateReducer', () => {
  describe('startNewReportAction', () => {
    const action = startNewReportAction({
      default_filter: {1: 2},
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
});

describe('doRunReport', () => {
  let actions;
  let state;
  let idGen;

  beforeEach(() => {
    actions = [];
    state = {};
    idGen = new IdGenerator();
  });

  function dispatch(action) {
    actions.push(action);
  }

  function getState() {
    return state;
  }

  it('handles the happy path', promiseTest(async () => {
    const foundArgs = [];
    function fakeRunReport(...args) {
      foundArgs.push(args);
      return Promise.resolve({id: 99});
    };
    await doRunReport(
      idGen,
      fakeRunReport,
      2,
      'a',
      {1: 2})(
      dispatch,
      getState);
    expect(foundArgs).toEqual([[2, 'a', {1: 2}]]);
    expect(actions).toEqual([
      startRunningReportAction(1),
      removeRunningReportAction(1),
      newReportAction(99),
    ]);
  }));

  it('handles api failures', promiseTest(async () => {
    fail();
  }));
});
