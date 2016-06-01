import {map, forEach} from 'lodash-compat/collection';
import {zip, uniq} from 'lodash-compat/array';
import errorReducer from '../error-reducer';

import {
    errorAction,
    clearErrorsAction,
} from '../error-actions';


describe('errorReducer', () => {
  it('has default state', () => {
    const result = errorReducer(undefined, {});
    expect(result).toEqual({currentErrors: {}});
  });

  it('can add a field error', () => {
    const action = errorAction("Some Error", [
      {field: 'name', message: 'must have a z'},
      {field: 'price', message: 'must be 10 or more'},
    ]);
    const result = errorReducer({
      lastMessage: 'z',
      data: {
        name: [{field: 'name', message: 'must not be blank'}],
      },
    }, action);
    expect(result).toEqual({
      lastMessage: "Some Error",
      currentErrors: {
        name: [
          {field: 'name', message: 'must not be blank'},
          {field: 'name', message: 'must have a z'},
        ],
        price: [{field: 'price', message: 'must be 10 or more'}],
      },
    });
  });

  it('can handle an error with no data', () => {
    const action = errorAction("Some Error");
    const result = errorReducer({currentErrors: {}}, action);
    expect(result).toEqual({
      lastMessage: "Some Error",
      currentErrors: {},
    });
  });

  it('can clear errors', () => {
    const action = clearErrorsAction();
    const result = errorReducer({
      lastMessage: 'z',
      data: {
        name: [{field: 'name', message: 'must not be blank'}],
      },
    }, action);
    expect(result).toEqual({
      currentErrors: {},
    });
  });
});
