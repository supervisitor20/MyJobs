import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import Api from './api';
import {ReportFinder, ReportConfigurationBuilder} from './reportEngine';
import {getCsrf} from '../common/cookie';
import {WizardRouter} from './WizardRouter';

import React from 'react';
import ReactDOM from 'react-dom';

installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const reportingApi = new Api(myJobsApi);

const configBuilder = new ReportConfigurationBuilder(reportingApi);
const reportFinder = new ReportFinder(reportingApi, configBuilder);

ReactDOM.render(
  <WizardRouter reportFinder={reportFinder}/>,
  document.getElementById('reporting-app')
);
