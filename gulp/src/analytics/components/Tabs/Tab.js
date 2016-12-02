import React from 'react';
import {Component} from 'react';

class Tab extends Component {
  render() {
    const {tabData, id} = this.props;
    return (
      <div>
          <input className="tab-input" name="tabbed" id={'tabbed' + id} type="radio" defaultChecked/>
          <label className="tab" htmlFor={'tabbed' + id}><span className="tab-label">{tabData.PageLoadData.column_names[0].label}</span><span className="close-tab">X</span></label>
          {this.props.children}
      </div>
      );
  }
}

Tab.propTypes = {
  id: React.PropTypes.number.isRequired,
  children: React.PropTypes.element.isRequired,
  tabData: React.PropTypes.object.isRequired,
};

export default Tab;
