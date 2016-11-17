import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {Router, browserHistory} from 'react-router';
import configureStore from './store/configureStore';

// import DataApi from './api/MockDataApi';

import TabsContainer from './components/Tabs/TabsContainer';
import TableContainer from './components/Table/TableContainer';
import SideBar from './components/SideBar/SideBar';
import Calendar from './components/Calendar/Calendar';

let tabId = 1;
const initialState = {
  tabs: [
    {
      tabId: 0,
      tableHeader: [
        {key: "country", label: "Country"},
        {key: "population", label: "Population"},
        {key: "language", label: "Language"},
        {key: "states", label: "States"},
      ],
      table: [
        {id: 1, country: "USA", population: "320,000,000", states: "50", language: "English"},
        {id: 2, country: "China", population: "2,320,000,000", states: "450", language: "Chinese"},
        {id: 3, country: "Japan", population: "320,000,000", states: "254", language: "Japanese"},
        {id: 4, country: "Mexico", population: "320,000,000", states: "78", language: "Spanish"},
        {id: 5, country: "Germany", population: "320,000,000", states: "546", language: "German"},
        {id: 6, country: "Fiji", population: "320,000,000", states: "45", language: "Fiji Hindi"},
      ]
    }
  ],
  dimensions: [
    {id: 1, name: "Demographics"},
    {id: 2, name: "Geo"},
    {id: 3, name: "Technology"},
  ],
};

export const updateTable = () => {
  return {
    type: "UPDATE_TABLE",
    tabId: tabId,
    tableHeader: [
      {key: "state", label: "State"},
      {key: "pop2", label: "Population"},
      {key: "jobs", label: "Jobs"},
    ],
    table: [
      {id: 1, state: "Indiana", pop2: "320,000,000", jobs: "50",},
      {id: 2, state: "Texas", pop2: "2,320,000,000", jobs: "450",},
      {id: 3, state: "Florida", pop2: "320,000,000", jobs: "254",},
      {id: 4, state: "California", pop2: "30,000,000", jobs: "78",},
      {id: 5, state: "North Carolina", pop2: "5,000,000", jobs: "546",},
      {id: 6, state: "Georgia", pop2: "60,000,000", jobs: "45",},
    ],
  }
}


export const deleteTabAction = (id) => {
  return {
    type: "REMOVE_TAB",
    id
  }
}

const tabReducer = (state = initialState, action) => {
  switch(action.type){
    case "UPDATE_TABLE":
      return {
        ...state,
        tabs: [
          ...state.tabs,
        {
          tabId: tabId++,
          tableHeader: action.tableHeader,
          table: action.table,
        }
      ],
    };
    case "REMOVE_TAB":
      return {
        ...state,
        tabs: state.tabs.filter((tab) => tab.tabId !== action.id)
      };
    default:
      return state;
  }
}

const sidebarReducer = (state = initialState, action) => {
  return state;
}


const rootReducer = combineReducers({
  tabsList: tabReducer,
  sidebarList: sidebarReducer,
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

console.log("CURRENT STATE OF STORE: ", store.getState());

ReactDOM.render(
  <Provider store={store}>
    <TabsContainer/>
  </Provider>
  ,document.getElementById("app")
);

// ReactDOM.render(
//   <Calendar />
//   ,document.getElementById("app")
// );
