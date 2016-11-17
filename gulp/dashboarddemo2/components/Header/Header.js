import React from 'react';
import { Component } from 'react';
import Calendar from '../Calendar/Calendar';

class Header extends Component {
  render() {
    return(
      <div className="tabs-header">
        <span id="toggle_menu" className="toggle-menu fa fa-bars"></span>
          <ul className="nav navbar-nav navbar-right right-options">
            <li><Calendar/></li>
            <li><a href="#"><span className="fa fa-envelope-o"></span></a></li>
            <li><a href="#"><span className="fa fa-print"></span></a></li>
            <li><a href="#"><span className="fa fa-file-excel-o"></span></a></li>
          </ul>
      </div>
    );
  }
}

export default Header;
