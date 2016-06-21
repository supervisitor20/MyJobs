import confirmReducer from '../reducers/confirm-reducer';

import {promiseTest} from '../../common/spec';
import createReduxStore from '../../common/create-redux-store';

import {
  confirmShowAction,
  confirmHideAction,
  runConfirmInPlace,
} from '../actions/confirm-actions';

describe('confirmReducer', () => {
  describe('default state', () => {
    const result = confirmReducer(undefined, {});
    it('has expected values', () => {
      expect(result.data).toBeDefined();
      expect(result.data.show).toBeDefined();
    });
  });
});

describe('runConfirmInPlace', () => {
  let store;

  beforeEach(promiseTest(async () => {
    store = createReduxStore(
      confirmReducer,
      undefined);
  }));

  describe('after having started runConfirmInPlace:', () => {
    let runPromise;
    let resolve;
    let reject;

    beforeEach(promiseTest(async () => {
      runPromise = runConfirmInPlace(a => store.dispatch(a), 'hello');
      const state = store.getState()
      resolve = state.resolve;
      reject = state.reject;
    }));

    it('state has message', () => {
      expect(store.getState().data).toEqual({
        show: true,
        message: 'hello',
      });
    });

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
});
