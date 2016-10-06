import {navigationReducer} from '../reducers/navigation-reducer';

import errorReducer from '../../common/reducers/error-reducer';
import {promiseTest} from '../../common/spec';


import {
  doGetWorkflowStateChoices,
  doFilterRecords,
} from '../actions/navigation-actions';

import createReduxStore from '../../common/create-redux-store';
import {combineReducers} from 'redux';

class FakeApi {
  getWorkflowStates() {}
}

describe('doGetWorkflowStateChoices',() => {
  let store;
  let api;

  api = new FakeApi();
  store = createReduxStore(
    combineReducers({navigation: navigationReducer, error: errorReducer}),
    {}, {api});
  describe('after load', () => {
    beforeEach(promiseTest(async () => {
      expect(store.getState().navigation.workflowChoices.length).toEqual(1);
      spyOn(api, 'getWorkflowStates').and.returnValue(Promise.resolve([{name: 'WF1'}]))
      await store.dispatch(doGetWorkflowStateChoices())
    }));

  it('should have updated choices', () => {
    expect(store.getState().navigation.workflowChoices.length).toEqual(2);
    });
  });
});

describe('doFilterRecords',() => {
  let store;
  let api;
  const testState = {
      navigation: {
        workflowFilter: 'All',
        termFilter: '',
        filtersActive: true,
        filteredRecords: [],
      }
    };
  api = new FakeApi();
  store = createReduxStore(
    combineReducers({navigation: navigationReducer, error: errorReducer}),
    testState, {api});

  const testState = {
      navigation: {
        workflowFilter: 'All',
        termFilter: '',
        filtersActive: true,
        filteredRecords: [],
      }
    };

  it('should have updated choices', () => {
    });
});