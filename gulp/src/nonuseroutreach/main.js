import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';
import {MyJobsApi} from '../common/myjobs-api';
import Api from './api';
import {getCsrf} from 'common/cookie';
import {Container} from'./components/Container';
import {InboxManagement, OutreachRecordManagement} from './nonuseroutreachEngine';
import React from 'react';
import ReactDOM from 'react-dom';

installPolyfills();

const myJobsApi = new MyJobsApi(getCsrf());
const nuoApi = new Api(myJobsApi);
const inboxManager = new InboxManagement(nuoApi);
const recordsManager = new OutreachRecordManagement(nuoApi);

ReactDOM.render(
  <Container inboxManager = {inboxManager} recordsManager = {recordsManager} />,
    document.getElementById('content')
);
