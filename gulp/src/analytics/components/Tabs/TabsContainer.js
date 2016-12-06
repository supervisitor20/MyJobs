import React from 'react';
import {Component} from 'react';
import $ from "jquery";
import Tab from './Tab';
import TabsPanel from './TabsPanel';
import TableContainer from '../Table/TableContainer';
import ChartContainer from '../Charts/ChartContainer';

class TabsContainer extends Component {
  // resizeTabs(){
  //   var n = $("#tabbed .tab").length;
  //   var w = (50 / n);
  //   $("#tabbed .tab").width( w + '%');
  // }
  render() {
    // $(window).resize(this.resizeTabs.bind(this));
    const {tabData} = this.props;
    const tabs = tabData.navigation.map((tab, i) => {
      return (
        <Tab key={i} tabData={tab} id={i}>
          <TabsPanel panelData={tab} id={i}>
            <ChartContainer chartData={tab} />
            <TableContainer tableData={tab} />
          </TabsPanel>
        </Tab>
      );
    });
    return (
      <div id="tabbed">
        {tabs}
      </div>
    );
  }
}

TabsContainer.propTypes = {
  tabData: React.PropTypes.object.isRequired,
};

export default TabsContainer;
