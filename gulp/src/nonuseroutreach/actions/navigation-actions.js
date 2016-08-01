import {createAction} from 'redux-actions';

export const setPageAction = createAction(
  'SET_PAGE',
  (page, query, args) => ({page, query, args}));
