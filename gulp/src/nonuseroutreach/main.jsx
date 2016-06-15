import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import Api from './api';
import {getCsrf} from 'common/cookie';
import React from 'react';
import ReactDOM from 'react-dom';

// TODO: remove
import Inbox from './components/Inbox';

// new imports
import createReduxStore from '../common/create-redux-store';
import {combineReducers} from 'redux';
import {
  initialState,
  inboxManagementReducer,
} from './reducers/inbox-management-reducer';

import {Provider} from 'react-redux';
import NonUserOutreachRouter from './components/NonUserOutreachRouter';


installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const api = new Api(myJobsApi);
const reducer = combineReducers({
  inboxManagement: inboxManagementReducer,
});

const thunkExtra = {
  api: api,
};

const store = createReduxStore(reducer, initialState, thunkExtra);

ReactDOM.render(
  <Provider store={store}>
    <Inbox />
  </Provider>,
  document.getElementById('content')
);
