import {installPolyfills} from '../util/polyfills.js';
import Api from './api';
import {getCsrf} from 'util/cookie';
import {Container} from'./nonuseroutreach'
import {InboxManagement} from './nonuseroutreachEngine'
import React from 'react';
import ReactDOM from 'react-dom';

installPolyfills();

const api = new Api(getCsrf())
const inboxManager = new InboxManagement(api);

ReactDOM.render(
  <Container inboxManager = {inboxManager} />,
    document.getElementById('content')
);

