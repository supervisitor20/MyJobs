import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import IdGenerator from '../common/id-generator';
import createReduxStore from '../common/create-redux-store';
import Api from './api';
import {ReportFinder} from './reportEngine';
import {getCsrf} from '../common/cookie';
import ReportingRouter from './components/ReportingRouter';
import {combineReducers} from 'redux';
import dataSetMenuReducer from './reducers/dataset-menu-reducer';
import reportStateReducer from './reducers/report-state-reducer';
import reportListReducer from './reducers/report-list-reducer';
import errorReducer from 'common/reducers/error-reducer';
import loadingReducer from 'common/reducers/loading-reducer';
import {doInitialLoad} from './actions/compound-actions';
import {Provider} from 'react-redux';

import React from 'react';
import ReactDOM from 'react-dom';


installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const idGen = new IdGenerator();
const reportingApi = new Api(myJobsApi);

const reportFinder = new ReportFinder(reportingApi);

const reducer = combineReducers({
  reportState: reportStateReducer,
  reportList: reportListReducer,
  errors: errorReducer,
  loading: loadingReducer,
  dataSetMenu: dataSetMenuReducer,
});

const thunkExtra = {
  api: reportingApi,
  idGen,
};

const store = createReduxStore(reducer, undefined, thunkExtra);
store.dispatch(doInitialLoad());

ReactDOM.render(
  <Provider store={store}>
    <ReportingRouter reportFinder={reportFinder}/>
  </Provider>,
  document.getElementById('content')
);
