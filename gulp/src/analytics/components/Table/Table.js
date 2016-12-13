import React from 'react';
import {Component} from 'react';
import TableSearch from './TableSearch';

class Table extends Component {
  render() {
    const {tableData} = this.props;
    console.log(tableData);
    return (
      <div id="table_data">
        <div id="table_search">
              <TableSearch/>
            </div>
            <div className="clearfix"></div>
        <table id="data_table" className="title-data rwd-table">
          {this.props.children}
        </table>
      </div>
    );
  }
}

Table.propTypes = {
  children: React.PropTypes.arrayOf(
    React.PropTypes.element.isRequired,
  ),
  tableData: React.PropTypes.object.isRequired,
};

export default Table;
