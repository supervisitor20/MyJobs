import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import IdGenerator from '../common/id-generator';
import createReduxStore from '../common/create-redux-store';
import Api from './api';
import {ReportFinder, ReportConfigurationBuilder} from './reportEngine';
import {getCsrf} from '../common/cookie';
import {WizardRouter} from './WizardRouter';
import {combineReducers} from 'redux';
import reportStateReducer from './report-state-reducer';
import reportListReducer from './report-list-reducer';
import errorReducer from './error-reducer';
import {doInitialLoad} from './compound-actions';
import {Provider} from 'react-redux';

import React from 'react';
import ReactDOM from 'react-dom';


installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const idGen = new IdGenerator();
const reportingApi = new Api(myJobsApi);

const configBuilder = new ReportConfigurationBuilder(reportingApi);
const reportFinder = new ReportFinder(reportingApi, configBuilder);

const reducer = combineReducers({
  reportState: reportStateReducer,
  reportList: reportListReducer,
  errors: errorReducer,
});

const thunkExtra = {
  api: reportingApi,
  idGen,
};

const store = createReduxStore(reducer, undefined, thunkExtra);
store.dispatch(doInitialLoad());

ReactDOM.render(
  <Provider store={store}>
    <WizardRouter reportFinder={reportFinder}/>
  </Provider>,
  document.getElementById('content')
);
