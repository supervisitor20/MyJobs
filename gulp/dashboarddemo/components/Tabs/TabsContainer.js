import React from 'react';
import { Component } from 'react';
import {connect} from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import {deleteTabAction} from '../../main';
import Tab from './Tab';
import TabsPanel from './TabsPanel';
import TableContainer from '../Table/TableContainer';
import SimpleBarCharts from '../Charts/SimpleBarChart';

class TabsContainer extends Component {
  constructor(props, context){
    super(props);
  }
  deleteCurrentTab(){
    const {dispatch} = this.props;
    dispatch(deleteTabAction());
  }
  render(){
    const {tabsList} = this.props;
    const tabs = tabsList.tabs.map((tab,i) => {
      return(
        <Tab key={i} tabData={tab}  id={tab.tabId} deleteTab={this.deleteCurrentTab.bind(this)}>
          <TabsPanel panelData={tab} id={tab.tabId}>
            <SimpleBarCharts/>
            <TableContainer tableData={tab}/>
          </TabsPanel>
        </Tab>
      );
    });
    return(
      <div>
        {tabs}
      </div>
    );
  }
}

export default connect(state => ({
  tabsList: state.tabsList,
}))(TabsContainer);
