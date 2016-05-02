import React, {Component} from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

export class OutreachRecordTable extends Component {

  // It's a data format example.
  //priceFormatter(cell, row){
  //  return '<i class="glyphicon glyphicon-usd"></i> ' + cell;
  //}
  //dataFormat={this.priceFormatter}

  constructor(props) {
    super(props);
    this.state = {
      tableHeight: 0,
      tableWidth: 0,
      records: this.getRecords()
    };
  }

  getRecords() {
    console.log('')
    let list_records = []
    for (let i = 0; i < 100; i++) {
    list_records.push({
          date: '01/01/2016',
          inbox: 'testinbox@test.com',
          from: 'outreachdude@test.com',
          body: i,
          state: 'Reviewed'
        });
    }
    return list_records;
  }

  render() {
    const isIE = /*@cc_on!@*/false || !!document.documentMode;
    return (
      <BootstrapTable data={this.state.records}
                      striped={false}
                      hover={true}
                      search={true}
                      pagination={!isIE}>
        <TableHeaderColumn dataField="date"
                           dataAlign="center"
                           dataSort={true}
                           isKey={true}>Date
        </TableHeaderColumn>
        <TableHeaderColumn dataField="inbox"
                           dataAlign="center"
                           dataSort={true}>Inbox
        </TableHeaderColumn>
        <TableHeaderColumn dataField="from"
                           dataAlign="center"
                           dataSort={true}>From
        </TableHeaderColumn>
        <TableHeaderColumn dataField="body"
                           dataAlign="center"
                           dataSort={true}>Body
        </TableHeaderColumn>
        <TableHeaderColumn dataField="state"
                           dataAlign="center"
                           dataSort={true}>Action State
        </TableHeaderColumn>
      </BootstrapTable>
    );
  }
}

OutreachRecordTable.propTypes = {};
