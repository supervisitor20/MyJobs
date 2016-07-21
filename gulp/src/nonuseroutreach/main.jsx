import React from 'react';
import ReactDOM from 'react-dom';

import 'babel/polyfill';
import createReduxStore from '../common/create-redux-store';
import {Provider} from 'react-redux';
import {combineReducers} from 'redux';
import {installPolyfills} from '../common/polyfills';

import Api from './api';
import {MyJobsApi} from '../common/myjobs-api';
import {getCsrf} from 'common/cookie';
import NonUserOutreachRouter from './components/NonUserOutreachRouter';

import loadingReducer, {
  initialLoading,
} from '../common/reducers/loading-reducer';
import {
  initialInboxes,
  inboxManagementReducer,
} from './reducers/inbox-management-reducer';
import {
  initialNavigation,
  navigationReducer,
} from './reducers/navigation-reducer';
import {
  initialRecords,
  recordManagementReducer,
} from './reducers/record-management-reducer';

// cross-browser support
installPolyfills();

// map state keys to reducers
const reducer = combineReducers({
  inboxes: inboxManagementReducer,
  records: recordManagementReducer,
  navigation: navigationReducer,
  loading: loadingReducer,
});

// state to pass to our reducer when the app starts
export const initialState = {
  inboxes: initialInboxes,
  records: initialRecords,
  navigation: initialNavigation,
  loading: initialLoading,
};

const myJobsApi = new MyJobsApi(getCsrf());
const api = new Api(myJobsApi);
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
