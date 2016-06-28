import React from 'react';
import ReactDOM from 'react-dom';

import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';

import createReduxStore from '../common/create-redux-store';
import {Provider} from 'react-redux';
// import {combineReducers} from 'redux';

import ImportWizardRouter from './components/ImportWizardRouter';

installPolyfills();

const reducer = (state) => state;
const initialState = {};
const thunkExtra = {};

const store = createReduxStore(reducer, initialState, thunkExtra);

ReactDOM.render(
  <Provider store={store}>
    <ImportWizardRouter />
  </Provider>,
  document.getElementById('content')
);
