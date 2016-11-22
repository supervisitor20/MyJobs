import React from 'react';
import { connect } from 'react-redux';
import {doGetPageData} from '../actions/table-filter-action';
import SideBar from './SideBar/SideBar';
import Header from './Header/Header';
import DashBoardHeader from './Header/DashBoardHeader';
import ChartContainer from './Charts/ChartContainer';
import TableContainer from './Table/TableContainer';

class AnalyticsApp extends React.Component {
  componentDidMount(){
    const {dispatch} = this.props;
    dispatch(doGetPageData());
  }
  render(){
    const {analytics} = this.props;
    if(analytics.fetching){
      return(
        <div></div>
      );
    }else{
    return(
      <div id="page_wrapper">
          <SideBar sideData={analytics}/>
          <Header headerData={analytics}/>
        <div id="page_content">
          <DashBoardHeader />
          <ChartContainer chartData={analytics}/>
          <TableContainer tableData={analytics}/>
        </div>
      </div>
    );
  }
  }
}

export default connect(state => ({
  analytics: state.pageLoadData
}))(AnalyticsApp);
