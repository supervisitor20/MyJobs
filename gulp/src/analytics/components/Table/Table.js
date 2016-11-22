import React from 'react';
import {Component} from 'react';
import DimensionList from '../Dimensions/Dimension';

class Table extends Component {
  render() {
    return (
      <div id="table_data">
        <div id="table_search">
          <DimensionList/>
              <input type="text" id="search_table" placeholder="Search..." title="Type Search" />
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
  children: React.PropTypes.element.isRequired,
};

export default Table;
