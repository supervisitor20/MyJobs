import React from 'react';
import { Component } from 'react';
import SideBarDimension from './SideBarDimensionList';

class SideBar extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const dimensions = [
      {name: 'Demographics'},
      {name: 'Geo'},
      {name: 'Technology'},
      {name: 'Mobile'},
    ];
    const dimension = dimensions.map((dim, i) => {
      return (
        <SideBarDimension key={i} dimension={dim} />
      );
    });
    return (
      <div id="menu">
        <ul className="sidebar-container">
          <li className="side-dimension-header">
            <p className="filter-header">Dimensions</p>
            <div className="clearfix"></div>
           </li>
          {dimension}
        </ul>
      </div>
    );
  }
}

export default SideBar;
