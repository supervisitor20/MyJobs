import React from 'react';
import {Component} from 'react';

class SideBarDimension extends Component {
  render() {
    const {dimension, active} = this.props;
    return (
      <li onClick={active} className="side-dimension">
         <span className="side-circle-btn"></span><span className="side-dimension-title">{dimension.display}</span>
      </li>
    );
  }
}

SideBarDimension.propTypes = {
  dimension: React.PropTypes.object.isRequired,
  active: React.PropTypes.func.isRequired,
};

export default SideBarDimension;
