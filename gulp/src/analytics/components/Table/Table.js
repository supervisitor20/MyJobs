import React from 'react';
import {Component} from 'react';
import TableSearch from './TableSearch';
// import DimensionList from '../Dimensions/Dimension';

class Table extends Component {
  render() {
    return (
      <div id="table_data">
        <div id="table_search">
          {// <DimensionList/>
          }
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
};

export default Table;
