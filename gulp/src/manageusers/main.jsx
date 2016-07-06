import React from 'react';
import 'babel/polyfill';
import {installPolyfills} from 'common/polyfills.js';
import {getCsrf} from 'common/cookie';
import {render} from 'react-dom';
import createReduxStore from 'common/create-redux-store';
import {combineReducers} from 'redux';
import {Provider} from 'react-redux';
import confirmReducer from 'common/reducers/confirm-reducer';

import {MyJobsApi} from 'common/myjobs-api';
import ManageUsersRouter from './components/ManageUsersRouter';

import activitiesListReducer from './reducers/activities-list-reducer';
import {
  doRefreshActivities,
} from './actions/compound-actions';

installPolyfills();

const reducer = combineReducers({
  activities: activitiesListReducer,
  confirmation: confirmReducer,
});

const api = new MyJobsApi(getCsrf());

const thunkExtra = {
  api: api,
};

const store = createReduxStore(reducer, undefined, thunkExtra);
store.dispatch(doRefreshActivities());

render((
  <Provider store={store}>
    <ManageUsersRouter />
  </Provider>
), document.getElementById('content'));
