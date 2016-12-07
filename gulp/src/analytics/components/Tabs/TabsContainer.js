import React from 'react';
import {Component} from 'react';
// import $ from "jquery";
import {connect} from 'react-redux';
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
  // <TabsPanel panelData={tab} id={i}>
  //   <ChartContainer chartData={tab} />
  //   <TableContainer tableData={tab} />
  // </TabsPanel>
  render() {
    // $(window).resize(this.resizeTabs.bind(this));
    const {analytics} = this.props;
    const tabs = analytics.navigation.map((tab, i) => {
      return (
        <Tab key={i} tabData={tab}>
          <TabsPanel panelData={tab}>
            <ChartContainer chartData={tab} />
            <TableContainer tableData={tab} />
          </TabsPanel>
        </Tab>
      );
    });
    return (
      <div id="tabbed">
        {tabs}
        <TabsPanel/>
      </div>
    );
  }
}

TabsContainer.propTypes = {
  analytics: React.PropTypes.object.isRequired,
};

export default connect(state => ({
  analytics: state.pageLoadData,
}))(TabsContainer);
