import {promiseTest} from '../../common/spec';
import createReduxStore from '../../common/create-redux-store';
import {
  doRefreshActivities,
} from '../actions/compound-actions';
import {combineReducers} from 'redux';
import activitiesListReducer from '../reducers/activities-list-reducer';

class FakeApi {
  get() {}
}

describe('doRefreshActivities', () => {
  let store;
  let api;

  beforeEach(promiseTest(async () => {
    api = new FakeApi();

    store = createReduxStore(
      activitiesListReducer,
      undefined,
      {api});
  }));

  describe('after API succeeds:', () => {
    let runPromise;
    let resolve;
    let reject;

    beforeEach(promiseTest(async () => {
      spyOn(api, 'get').and.returnValue(Promise.resolve([
        {
          activity_name: "create product",
          app_access_name: "MarketPlace",
          activity_description: "Add new products",
          activity_id: 33,
          app_access_id: 5
        },
        {
          activity_name: "read product",
          app_access_name: "MarketPlace",
          activity_description: "View existing products.",
          activity_id: 34,
          app_access_id: 5
        },
      ]))
      await store.dispatch(doRefreshActivities())
    }));

    it('data is in right place', () => {
      expect(store.getState().data).toEqual([
        {
          activity_name: "create product",
          app_access_name: "MarketPlace",
          activity_description: "Add new products",
          activity_id: 33,
          app_access_id: 5
        },
        {
          activity_name: "read product",
          app_access_name: "MarketPlace",
          activity_description: "View existing products.",
          activity_id: 34,
          app_access_id: 5
        },
      ]);
    });
  });

  describe('after API fails:', () => {
    let runPromise;
    let resolve;
    let reject;

    beforeEach(promiseTest(async () => {
      spyOn(api, 'get').and.throwError(new Error("some error"));
      await store.dispatch(doRefreshActivities())
    }));

    it('data is unchanged', () => {
      expect(store.getState().data).not.toBeDefined();
    });
  });
});
