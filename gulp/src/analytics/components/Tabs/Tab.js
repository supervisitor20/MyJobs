import React from 'react';
import { Component } from 'react';
import TabsPanel from './TabsPanel';

class Tab extends Component{
  render(){
    const {id} = this.props;
    return(
      <div>
          <input className="tab-input" name="tabbed" id={"tabbed" + id} type="radio" defaultChecked/>
          <label className="tab" htmlFor={"tabbed" + id}><span className="tab-label">{"Lorem " + id}</span><span className="close-tab">X</span></label>
          {this.props.children}
      </div>
      );
  }
}

export default Tab;
