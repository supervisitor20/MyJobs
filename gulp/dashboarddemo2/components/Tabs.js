import React from 'react';
import { Component } from 'react';
import Charts from './Charts';

var Tabs = React.createClass({
  getInitialState: function() {
    return {activeTab: 0};
  },
  selectActiveTab: function(index) {
    this.setState({activeTab: index});
    return false;
  },
  render: function() {
    return (
      <div>
        <span id="toggle_menu"></span>
        <ul className="tabs">
          {this.props.data.map(function (tab, index) {
            var activeClass = this.state.activeTab === index ? 'active' : '';

            return (
              <li key={index} className={'tab ' + activeClass} >
                <a href="#" onClick={this.selectActiveTab.bind(this, index)}>{tab.title}</a>
              </li>
            )
          }, this)}
        </ul>
        <div className="tabs-content">
          {this.props.data.map(function (tab, index) {
            var activeClass = this.state.activeTab === index ? 'active' : '';

            return (
              <div key={index} className={'content ' + activeClass}>
                <Charts/>
              </div>
            )
          }, this)}
        </div>
      </div>
    );
  }
});

export default Tabs;
