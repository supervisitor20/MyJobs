import React from 'react';
import ReactDOM from 'react-dom';

import 'babel/polyfill';
import createReduxStore from '../common/create-redux-store';
import {Provider} from 'react-redux';
import {combineReducers} from 'redux';
import {installPolyfills} from '../common/polyfills';

import ChartDisplay from './components/ChartDisplay';
import Api from './api';
import {MyJobsApi} from '../common/myjobs-api';
import {getCsrf} from 'common/cookie';
import
chartRenderReducer,
{
  initialChartData,
} from './reducers/chart-data-reducer';

// cross-browser support
installPolyfills();

// map state keys to reducers
const reducer = combineReducers({
  chartRender: chartRenderReducer,
});

// state to pass to our reducer when the app starts
export const initialState = {
  chartRender: initialChartData,
};

const myJobsApi = new MyJobsApi(getCsrf());
const api = new Api(myJobsApi);


const thunkExtra = {
  api,
};

const store = createReduxStore(reducer, initialState, thunkExtra);

ReactDOM.render(
  <Provider store={store}>
    <ChartDisplay />
  </Provider>
  , document.getElementById('content')
);
