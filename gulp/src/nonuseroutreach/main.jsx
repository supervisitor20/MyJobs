import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import Api from './api';
import {getCsrf} from 'common/cookie';
import React from 'react';
import ReactDOM from 'react-dom';

// new imports
import createReduxStore from '../common/create-redux-store';
import {combineReducers} from 'redux';
import {Provider} from 'react-redux';
import NonUserOutreachRouter from './components/NonUserOutreachRouter';

installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const api = new Api(myJobsApi);

const inboxReducer = (state = {}) => state;

const reducer = combineReducers({
  inboxes: inboxReducer,
});

const thunkExtra = {
  api: api,
};

const store = createReduxStore(reducer, {}, thunkExtra);

ReactDOM.render(
  <Provider store={store}>
    <NonUserOutreachRouter api = {api} />
  </Provider>,
  document.getElementById('content')
);
