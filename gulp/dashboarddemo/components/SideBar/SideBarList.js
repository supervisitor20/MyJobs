import React from 'react';
import { Component } from 'react';

class SideBarList extends Component{
  render(){
    const { dimension } = this.props;
    console.log(dimension);
    const dimensionList = dimension.dimensions.map((dimension, i) => {
      return(
        <li key={i}>
          <a href=''>
            {dimension.name}
          </a>
        </li>
      );
    });
    return(
      <ul>
        {dimensionList}
      </ul>
    );
  }
}

export default SideBarList;
