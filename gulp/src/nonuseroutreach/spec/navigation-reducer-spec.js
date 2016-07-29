import {
  navigationReducer as reducer,
  initialNavigation as state,
} from '../reducers/navigation-reducer';

import {setPageAction} from '../actions/navigation-actions';

describe('navigationReducer', () => {
  describe('setPageAction', () => {
    it('should update tips.', () => {
      const result = reducer(state, setPageAction('records'));
      expect(result.currentPage).toEqual('records');
      expect(result.tips).toEqual([
        'Use this page to view outreach records from non-users.',
      ]);
    });

    it('should update query.', () => {
      const result = reducer(state, setPageAction('records', {1: 2}));
      expect(result.currentQuery).toEqual({1: 2});
    });

    it('should update args.', () => {
      const result = reducer(state, setPageAction('records', null, [1, 2]));
      expect(result.currentArgs).toEqual([1, 2]);
    });
  });
});

