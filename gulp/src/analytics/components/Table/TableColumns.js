import React from 'react';
import {Component} from 'react';

class TableColumns extends Component {
  render() {
    const {data} = this.props;
    const col = data.column_names;
    const colHeaders = col.map((colData) => {
      return (
        <th key={colData.key}>{colData.label}</th>
      );
    });
    return (
      <thead>
        <tr>{colHeaders}</tr>
        <tr className="warning no-result">
          <td colSpan="8"><i className="fa fa-warning"></i>No Results Found</td>
        </tr>
      </thead>
    );
  }
}

TableColumns.propTypes = {
  data: React.PropTypes.object.isRequired,
};

export default TableColumns;
