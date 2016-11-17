import React from 'react';
import { Component } from 'react';
import TabsPanel from './TabsPanel';

class Tab extends Component{
  render(){
    const {id, deleteTab} = this.props;
    return(
      <div>
        <input className="tab-input" name="tabbed" id={"tab_" + id} type="radio" defaultChecked/>
        <label className="tab" htmlFor={"tab_" + id}><span className="tab-label">{"TAB " + id}</span><span onClick={this.deleteSelectedTab} className="close-tab">X</span></label>
        {this.props.children}
      </div>
      );
  }
}

export default Tab;
