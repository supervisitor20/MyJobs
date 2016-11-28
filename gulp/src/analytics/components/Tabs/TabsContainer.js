import React from 'react';
import {Component} from 'react';
import Tab from './Tab';
import TabsPanel from './TabsPanel';
import TableContainer from '../Table/TableContainer';
import ChartContainer from '../Charts/ChartContainer';
import DashBoardHeader from '../Header/DashBoardHeader';

class TabsContainer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {tabData} = this.props;
    const tabs = tabData.navigation.map((tab, i) => {
      return (
        <Tab key={i} tabData={tabData} id={i}>
          <TabsPanel panelData={tabData} id={i}>
            <DashBoardHeader/>
            <ChartContainer chartData={tabData} />
            <TableContainer tableData={tabData} />
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
