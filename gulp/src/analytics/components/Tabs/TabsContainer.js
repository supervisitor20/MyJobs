import React from 'react';
import { Component } from 'react';
import {connect} from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import {deleteTabAction} from '../../main';
import Tab from './Tab';
import TabsPanel from './TabsPanel';
import TableContainer from '../Table/TableContainer';
import SimpleBarCharts from '../Charts/SimpleBarChart';
import TitleCharts from '../TitleCharts';
import DashBoardHeader from '../Header/DashBoardHeader';
import {applyFilter} from '../../main';

class TabsContainer extends Component {
  constructor(props, context){
    super(props);
  }
  update(){
    const {dispatch} = this.props;
    dispatch(applyFilter());
  }
  render(){

    const analyticsData = {
        tables: [
          {
            column_names: [
              {key: "country", label: "Country"},
              {key: "job_views", label: "Job Views"},
              {key:'visits', label: "Visits"}
            ],
            rows: [
              {country: "USA", job_views: "23465",  visits: "345454"},
              {country: "China", job_views: "23444", visits: "345345"},
              {country: "Japan", job_views: "34545", visits: "76565"},
              {country: "Mexico", job_views: "2356", visits: "3568"},
              {country: "Germany", job_views: "45645", visits: "4356"},
              {country: "Fiji", job_views: "1435", visits: "6754"}
            ],
          },
        ],
    }

    const tabs = analyticsData.tables.map((table, i) => {
      return(
        <Tab key={i} tabData={table}  id={i}>
          <TabsPanel panelData={table} id={i}>
            <DashBoardHeader/>
            <TitleCharts chartData={table} />
            <TableContainer tableData={table} updateFilter={this.update.bind(this)}/>
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
  analyticsData: state.filterData
}))(TabsContainer);
