import processEmailReducer from '../reducers/process-email-reducer';
import errorReducer from '../../common/reducers/error-reducer';

import {
  doLoadEmail,
  resetProcessAction,
} from '../actions/process-email-actions';

import {promiseTest} from '../../common/spec';

import createReduxStore from '../../common/create-redux-store';
import {combineReducers} from 'redux';

class FakeApi {
  getEmail(recordId) {}
}

describe('doSearch', () => {
  let store;
  let api;

  beforeEach(() => {
    api = new FakeApi();
    store = createReduxStore(
      combineReducers({process: processEmailReducer, error: errorReducer}),
      {}, {api});
  });

  describe('after a search', () => {
    const email = {
      id: 2,
      summary: 'some title',
      body: 'some info',
    };
    beforeEach(promiseTest(async () => {
      spyOn(api, 'getEmail').and.returnValue(Promise.resolve(email));
      await store.dispatch(doLoadEmail(2));
    }));

    it('it should have the email', () => {
      expect(store.getState().process.email).toEqual(email);
    });

    it('it should be in the reset state', () => {
      expect(store.getState().process.state).toEqual('RESET');
    });
  });

  describe('after an error', () => {
    beforeEach(promiseTest(async () => {
      spyOn(api, 'getEmail').and.throwError('some error');
      await store.dispatch(doLoadEmail(2));
    }));

    it('it should remember the error', () => {
      expect(store.getState().error.lastMessage).toEqual('some error');
    });
  });
});


