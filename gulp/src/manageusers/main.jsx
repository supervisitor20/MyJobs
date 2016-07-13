import React from 'react';
import 'babel/polyfill';
import {installPolyfills} from 'common/polyfills.js';
import {getCsrf} from 'common/cookie';
import {render} from 'react-dom';
import createReduxStore from 'common/create-redux-store';
import {combineReducers} from 'redux';
import {Provider} from 'react-redux';

import confirmReducer, {
  initialConfirmation,
} from 'common/reducers/confirm-reducer';
import loadingReducer, {
  initialLoading,
} from 'common/reducers/loading-reducer';


import {MyJobsApi} from 'common/myjobs-api';
import ManageUsersRouter from './components/ManageUsersRouter';

import activitiesListReducer, {
  initialActivities,
} from './reducers/activities-list-reducer';
import {doRefreshActivities} from './actions/activities-list-actions';

import userReducer, {initialUsers} from './reducers/user-reducer';

installPolyfills();

const reducer = combineReducers({
  activities: activitiesListReducer,
  users: userReducer,
  loading: loadingReducer,
  confirmation: confirmReducer,
});

const api = new MyJobsApi(getCsrf());

const thunkExtra = {
  api: api,
};

const initialState = {
  activities: initialActivities,
  users: initialUsers,
  confirmation: initialConfirmation,
  loading: initialLoading,
};

const store = createReduxStore(reducer, initialState, thunkExtra);
store.dispatch(doRefreshActivities());

render((
  <Provider store={store}>
    <ManageUsersRouter />
  </Provider>
), document.getElementById('content'));
