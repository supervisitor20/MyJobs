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
/*
    it('state has resolve callback', () => {
      expect(resolve).toBeDefined();
    });

    it('state has reject callback', () => {
      expect(reject).toBeDefined();
    });

    describe('after ok completion:', () => {
      let result;

      beforeEach(promiseTest(async () => {
        resolve(true);
        result = await runPromise;
      }));

      it('has a result', () => {
        expect(result).toBe(true);
      });

      it('state is clear', () => {
        expect(store.getState().data).toEqual({
          show: false,
        });
      });
    });

    describe('after cancel completion:', () => {
      let result;

      beforeEach(promiseTest(async () => {
        resolve(false);
        result = await runPromise;
      }));

      it('has a result', () => {
        expect(result).toBe(false);
      });

      it('state is clear', () => {
        expect(store.getState().data).toEqual({
          show: false,
        });
      });
    });

    describe('after error completion:', () => {
      let result;

      it('throws an exception', promiseTest(async () => {
        const error = new Error('some error');
        reject(error);
        try {
          await runPromise;
          fail('expected runPromise to throw exception');
        } catch(e) {}
      }));
    });
  });
*/
