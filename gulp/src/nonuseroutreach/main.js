import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills.js';
import Api from './api';
import {getCsrf} from 'common/cookie';
import {Container} from'./components/Container';
import {InboxManagement} from './nonuseroutreachEngine';
import React from 'react';
import ReactDOM from 'react-dom';

installPolyfills();

const api = new Api(getCsrf());
const inboxManager = new InboxManagement(api);

ReactDOM.render(
  <Container inboxManager = {inboxManager} />,
    document.getElementById('content')
);
