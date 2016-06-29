import React from 'react';
import ReactDOM from 'react-dom';

import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills';

import createReduxStore from '../common/create-redux-store';
import {Provider} from 'react-redux';
import {combineReducers} from 'redux';

import api from './api';

import ImportWizardRouter from './components/ImportWizardRouter';

import {
  columnReducer,
  initialColumns,
} from './reducers/column-reducer';


installPolyfills();

const initialState = {
  columns: initialColumns,
};

const reducer = combineReducers({
  columns: columnReducer,
});

const thunkExtra = {
  api: api,
};

const store = createReduxStore(reducer, initialState, thunkExtra);

ReactDOM.render(
  <Provider store={store}>
    <ImportWizardRouter />
  </Provider>,
  document.getElementById('content')
);
