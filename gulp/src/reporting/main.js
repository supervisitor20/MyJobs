import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import Api from './api';
import {ReportFinder, ReportConfigurationBuilder} from './reportEngine';
import {getCsrf} from '../common/cookie';
import {WizardRouter} from './WizardRouter';
import {combineReducers, createStore} from 'redux';
import {reportStateReducer} from './report-state-reducer';
import {Provider} from 'react-redux';

import React from 'react';
import ReactDOM from 'react-dom';

installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const reportingApi = new Api(myJobsApi);

// XXX: delete these
const configBuilder = new ReportConfigurationBuilder(reportingApi);
const reportFinder = new ReportFinder(reportingApi, configBuilder);

const reducer = combineReducers({
  reportState: reportStateReducer,
});

const store = createStore(reducer, {
  reportState: {},
});

ReactDOM.render(
  <Provider store={store}>
    <WizardRouter reportFinder={reportFinder}/>
  </Provider>,
  document.getElementById('content')
);
