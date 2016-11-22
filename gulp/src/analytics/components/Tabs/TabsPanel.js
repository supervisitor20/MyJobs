import React from 'react';
import { Component } from 'react';

import TableContainer from '../Table/TableContainer';

class TabsPanel extends Component{
  render(){
    const {id} = this.props;
    return(
      <div className="tab-content">
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default TabsPanel;
