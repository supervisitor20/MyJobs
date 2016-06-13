import React, {Component, PropTypes} from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

export class OutreachRecordTable extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tableHeight: 0,
      tableWidth: 0,
      records: [],
    };
    this.getRecords();
  }

  async getRecords() {
    const records = await this.props.api.getExistingOutreachRecords();
    this.setState({
      records: records,
    });
  }

  render() {
    const isIE = /* @cc_on!@ */false || !!document.documentMode;
    return (
      <BootstrapTable data={this.state.records}
                      hover
                      search
                      pagination={!isIE}
                      height={isIE ? '600px' : undefined}
                      options={{paginationSize: 3,
                                noDataText: 'No records found'}}>
        <TableHeaderColumn dataField="date_added"
                           dataAlign="center"
                           dataSort
                           isKey>Date
        </TableHeaderColumn>
        <TableHeaderColumn dataField="outreach_email"
                           dataAlign="center"
                           dataSort>Inbox
        </TableHeaderColumn>
        <TableHeaderColumn dataField="from_email"
                           dataAlign="center"
                           dataSort>From
        </TableHeaderColumn>
        <TableHeaderColumn dataField="current_workflow_state"
                           dataAlign="center"
                           dataSort>Action State
        </TableHeaderColumn>
      </BootstrapTable>
    );
  }
}

OutreachRecordTable.propTypes = {
  api: PropTypes.object.isRequired,
};
