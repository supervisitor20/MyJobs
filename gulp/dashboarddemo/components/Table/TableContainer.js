import React from 'react';
import { Component } from 'react';
import {connect} from 'react-redux';
import Table from './Table';
import TableColumns from './TableColumns';
import TableRows from './TableRows';

import {addTabAction} from '../../main';
import {updateTable} from '../../main';

class TableContainer extends Component{
  constructor(props, context){
    super(props);
  }
  update(){
    const {dispatch} = this.props;
    console.log(dispatch(updateTable()));
  }
  render(){
    const {tableData,tabId} = this.props;
    return(
      <div>
        <button onClick={this.update.bind(this)}>UPDATE TABLE DATA</button>
        <Table data={tableData}>
          <TableColumns/>
          <TableRows/>
        </Table>
      </div>
    );
  }
}

export default connect(state => ({

}))(TableContainer);
