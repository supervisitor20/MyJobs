import {installPolyfills} from '../util/polyfills.js';
//import Api from './api';
import {Container} from'./nonuseroutreach'
import {InboxManagement} from './nonuseroutreachEngine'
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  <Container />,
    document.getElementById('content')
);

