import React from 'react';
import { Component } from 'react';

class SideBar extends Component {
  render() {
    return(
      <div id='menu'>
        <div className="side-bar-mobile-header">
              <span className="dimension-filter-clear">Clear All</span>
              <span className="dimension-filter">Dimensions</span>
              <span id="close"><i className="fa fa-times" aria-hidden="true"></i></span>
        </div>
        <div className="clearfix"></div>
        <ul className="accordion-container">
            <li className="side-accordion side-accordion-header">
                <p className="filter-header">Dimensions</p>
                <p className="filter-clear-all">Clear All</p>
            </li>
            <li id="genre" className="side-accordion">
              <label htmlFor="ac-1">
                Demographics
              </label>
            </li>
            <li id="mpaa" className="side-accordion">
              <label htmlFor="ac-1">
                Geographics
              </label>
            </li>
            <li id="release" className="side-accordion">
              <label htmlFor="ac-1">
                Technology
              </label>
            </li>
            <li id="mobile" className="side-accordion">
              <label htmlFor="ac-1">
                Mobile
              </label>
            </li>
        </ul>
      </div>
    );
  }
}

export default SideBar;
