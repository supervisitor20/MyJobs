import React from 'react';
import {Component} from 'react';
import {Link} from 'react-router';

// <span id="toggle_menu" className="toggle-menu fa fa-bars"></span>
//   <ul className="nav navbar-nav navbar-right right-options">
//     <li><a href="#"><span className="fa fa-envelope-o"></span></a></li>
//     <li><a href="#"><span className="fa fa-print"></span></a></li>
//     <li><a href="#"><span className="fa fa-file-excel-o"></span></a></li>
//   </ul>

class Header extends Component {
  render() {
    const {headerData} = this.props;
    const navLinks = headerData.navigation.map((navLink, i) =>{
      return (
        <Link key={i} to="/" className="nav-link">{'TAB: ' + navLink.navId}</Link>
      );
    });
    return (
      <div className="tabs-header">
        <nav>
          {navLinks}
         <ul className="nav navbar-nav navbar-right right-options">
          <li><a href="#"><span className="fa fa-envelope-o"></span></a></li>
          <li><a href="#"><span className="fa fa-print"></span></a></li>
          <li><a href="#"><span className="fa fa-file-excel-o"></span></a></li>
          </ul>
        </nav>
      </div>
    );
  }
}

Header.propTypes = {
  headerData: React.PropTypes.object.isRequired,
};

export default Header;
