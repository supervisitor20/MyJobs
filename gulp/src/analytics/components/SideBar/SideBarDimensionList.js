import React from 'react';
import { Component } from 'react';

class SideBarDimension extends Component {
  constructor(props){
    super(props);
  }
  render() {
    const {dimension} = this.props;
    return(
      <li className="side-dimension">
        <span>{dimension.name}</span>
      </li>
    );
  }
}

export default SideBarDimension;
