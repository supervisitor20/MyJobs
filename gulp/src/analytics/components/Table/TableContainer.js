import React from 'react';
import {Component} from 'react';
import Table from './Table';
import TableColumns from './TableColumns';
import TableRows from './TableRows';


class TableContainer extends Component {
  render() {
    const {tableData} = this.props;
    const tableData2 = tableData.PageLoadData;
    return (
      <div>
        <Table>
          <TableColumns data={tableData2}/>
          <TableRows data={tableData2} />
        </Table>
      </div>
    );
  }
}

TableContainer.propTypes = {
  tableData: React.PropTypes.object.isRequired,
};

export default TableContainer;
