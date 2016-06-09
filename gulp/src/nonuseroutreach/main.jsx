import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import Api from './api';
import {getCsrf} from 'common/cookie';
import {Container} from'./components/Container';
import React from 'react';
import ReactDOM from 'react-dom';

// new imports
import createReduxStore from '../common/create-redux-store';
import {combineReducers} from 'redux';
import {Provider} from 'react-redux';

installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const nuoApi = new Api(myJobsApi);

ReactDOM.render(
  <Container api = {nuoApi} />,
  document.getElementById('content')
);
