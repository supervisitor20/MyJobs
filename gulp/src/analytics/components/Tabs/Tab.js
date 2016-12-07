import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import {switchActiveTab} from '../../actions/tab-action';
import {removeSelectedTab} from '../../actions/tab-action';

class Tab extends Component {
  constructor() {
    super();
  }
  activeTab(tabId, event) {
    event.preventDefault();
    const {dispatch} = this.props;
    dispatch(switchActiveTab(tabId));
  }
  removeSelectedTab(tabId, event) {
    event.preventDefault();
    const {dispatch} = this.props;
    dispatch(removeSelectedTab(tabId));
  }
  render() {
    const {tabData} = this.props;
    return (
      <div>
          <a onClick={this.activeTab.bind(this, tabData.navId)} className={tabData.active ? 'tab active-tab' : 'tab'} href="#/">{tabData.PageLoadData.column_names[0].label}<span onClick={this.removeSelectedTab.bind(this, tabData.navId)} className="close-tab">X</span></a>
          {this.props.children}
      </div>
      );
  }
}

Tab.propTypes = {
  children: React.PropTypes.element.isRequired,
  tabData: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired,
};

export default connect()(Tab);
