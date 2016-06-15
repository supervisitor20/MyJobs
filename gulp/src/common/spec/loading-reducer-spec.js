import loadingReducer from '../reducers/loading-reducer.js';
import {
  markPageLoadingAction,
  markFieldLoadingAction,
  markOtherLoadingAction,
} from '../actions/loading-actions.js';

describe('loadingReducer', () => {
  it('has a default state', () => {
    const result = loadingReducer(undefined, {});
    expect(result).toEqual({
      mainPage: false,
      fields: {},
      other: {},
    });
  });

  it('can mark the page as loading', () => {
    const action = markPageLoadingAction(true);
    const result = loadingReducer({}, action);
    expect(result).toEqual({
      mainPage: true,
    });
  });

  it('can mark a field as loading', () => {
    const action = markFieldLoadingAction('name', true);
    const result = loadingReducer({}, action);
    expect(result).toEqual({
      fields: {
        name: true,
      },
    });
  });

  it('can mark an arbitrary object as loading', () => {
    const action = markOtherLoadingAction('name', true);
    const result = loadingReducer({}, action);
    expect(result).toEqual({
      other: {
        name: true,
      },
    });
  });
});
