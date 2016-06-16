import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import Api from './api';
import {getCsrf} from 'common/cookie';
import React from 'react';
import ReactDOM from 'react-dom';

import createReduxStore from '../common/create-redux-store';
import {combineReducers} from 'redux';

import {
  initialInboxes,
  inboxManagementReducer,
} from './reducers/inbox-management-reducer';

import {
  initialRecords,
  recordManagementReducer,
} from './reducers/record-management-reducer';

import {
  initialNavigation,
  navigationReducer,
} from './reducers/navigation-reducer';

import {Provider} from 'react-redux';
import NonUserOutreachRouter from './components/NonUserOutreachRouter';


installPolyfills();

export const initialState = {
  inboxes: initialInboxes,
  records: initialRecords,
  navigation: initialNavigation,
};

const myJobsApi = new MyJobsApi(getCsrf());
const api = new Api(myJobsApi);
const reducer = combineReducers({
  inboxes: inboxManagementReducer,
  records: recordManagementReducer,
  navigation: navigationReducer,
});

const thunkExtra = {
  api: api,
};

const store = createReduxStore(reducer, initialState, thunkExtra);

ReactDOM.render(
  <Provider store={store}>
    <NonUserOutreachRouter api = {api} />
  </Provider>,
  document.getElementById('content')
);
