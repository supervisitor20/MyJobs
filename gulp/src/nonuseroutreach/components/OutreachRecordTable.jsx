import React, {Component} from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import _ from 'lodash-compat';

export class OutreachRecordTable extends Component {

  // It's a data format example.
  //priceFormatter(cell, row){
  //  return '<i class="glyphicon glyphicon-usd"></i> ' + cell;
  //}
  //dataFormat={this.priceFormatter}

  constructor(props) {
    super(props);
    this.state = {
      products: [{
        id: 1,
        name: "Item name 1",
        price: 100
        },{
        id: 2,
        name: "Item name 2",
        price: 100
      }]
    }
  }

  render() {
    return (
      <BootstrapTable data={this.state.products} striped={false} hover={true}
                      pagination={true} search={true}>
        <TableHeaderColumn dataField="id" isKey={true} dataAlign="center"
                           dataSort={true}>Product ID</TableHeaderColumn>
        <TableHeaderColumn dataField="name" dataSort={true}>Product
          Name</TableHeaderColumn>
        <TableHeaderColumn dataField="price" >Product
          Price</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}

OutreachRecordTable.propTypes = {};
