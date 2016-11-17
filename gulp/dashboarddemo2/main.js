import React from 'react';
import ReactDOM from 'react-dom';

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';

import MovieApi from './api/analyticsDataApi';

import App from './App';

export function loadMovieTitleReducer(state={}, action){
  return state;
}

const rootReducers = combineReducers({
  movies: loadMovieTitleReducer,
});

const store = createStore(rootReducers);

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>
  ,document.getElementById('app')
);
