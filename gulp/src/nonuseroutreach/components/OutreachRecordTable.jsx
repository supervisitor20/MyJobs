import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

export default class OutreachRecordTable extends React.Component {

  render() {
    const {records} = this.props;
    const isIE = /* @cc_on!@ */false || !!document.documentMode;
    return (
      <BootstrapTable data={records}
                      hover
                      search
                      pagination={!isIE}
                      height={isIE ? '600px' : undefined}
                      options={{paginationSize: 3,
                                noDataText: 'No records found'}}>
        <TableHeaderColumn dataField="dateAdded"
                           dataAlign="center"
                           dataSort
                           isKey>Date
        </TableHeaderColumn>
        <TableHeaderColumn dataField="outreachEmail"
                           dataAlign="center"
                           dataSort>Inbox
        </TableHeaderColumn>
        <TableHeaderColumn dataField="fromEmail"
                           dataAlign="center"
                           dataSort>From
        </TableHeaderColumn>
        <TableHeaderColumn dataField="currentWorkflowState"
                           dataAlign="center"
                           dataSort>Action State
        </TableHeaderColumn>
      </BootstrapTable>
    );
  }
}

OutreachRecordTable.propTypes = {
  records: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      dateAdded: React.PropTypes.string.isRequired,
      outreachEmail: React.PropTypes.string.isRequired,
      fromEmail: React.PropTypes.string.isRequired,
      currentWorkflowState: React.PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
};
