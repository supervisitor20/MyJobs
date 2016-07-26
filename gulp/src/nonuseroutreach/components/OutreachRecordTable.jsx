import React from 'react';
import {isIE8} from '../../common/dom';
import {Button} from 'react-bootstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

/* OutreachRecordTable
 * Component which displays a list of outreach records (the OutreachRecord model
 * in Django).
 */

export default class OutreachRecordTable extends React.Component {
  reviewFormatter(recordId) {
    // Add OnClick when a function is created to swap to form view/wizard
    return <Button className="btn" key={recordId}>Review</Button>;
  }
  render() {
    const {records} = this.props;
    return (
      <BootstrapTable data={records}
                      hover
                      search
                      striped
                      pagination={!isIE8}
                      height={isIE8 ? '600px' : undefined}
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
        <TableHeaderColumn dataField="id"
                           dataAlign="center"
                           dataFormat={this.reviewFormatter} />
      </BootstrapTable>
    );
  }
}

OutreachRecordTable.propTypes = {
  records: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      // date teh record was created
      dateAdded: React.PropTypes.string.isRequired,
      // the inbox the record went to
      outreachEmail: React.PropTypes.string.isRequired,
      // the email the record was created from
      fromEmail: React.PropTypes.string.isRequired,
      // denotes what action, if any, was taken on the record (pending,
      // unprocessed, etc)
      currentWorkflowState: React.PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
};
