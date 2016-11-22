import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';

import 'babel/polyfill';
import createReduxStore from '../common/create-redux-store';
import {Provider} from 'react-redux';
import {combineReducers} from 'redux';
import {installPolyfills} from '../common/polyfills';

import AnalyticsApp from './components/AnalyticsApp';
import filterReducer, {initialPageData} from './reducers/table-filter-reducer';

import Api from './api';
import {MyJobsApi} from '../common/myjobs-api';
import {getCsrf} from 'common/cookie';

// cross-browser support
installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const api = new Api(myJobsApi);

const rootReducer = combineReducers({
  pageLoadData: filterReducer,
});

// state to pass to our reducer when the app starts
export const initialState = {
  pageLoadData: initialPageData,
};

const thunkExtra = {
  api,
};


const store = createReduxStore(rootReducer, initialState, thunkExtra);

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route path="/" component={AnalyticsApp}></Route>
    </Router>
  </Provider>
  ,document.getElementById('content')
);
