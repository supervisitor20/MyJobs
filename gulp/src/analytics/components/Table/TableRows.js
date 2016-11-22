import React from 'react';
import {Component} from 'react';

class TableRows extends Component {
  render() {
    const {data} = this.props;
    const rowData = data.rows;
    const columnData = data.column_names;
    const originalHeader = [];
    const modHeader = [];
    columnData.map((colData) => {
      originalHeader.push(colData);
      modHeader.push(colData);
    });
    originalHeader.shift();
    const mod = modHeader.splice(0, 1);
    const getHeaders = rowData.map((item, i) => {
      const firstCell = mod.map((colData, index) => {
        return (
          <td key={index}><a href="#">{item[colData.key]}</a></td>
        );
      });
      const cell = originalHeader.map((colData, ind) => {
        return (
          <td key={ind}>{item[colData.key]}</td>
        );
      });

      return <tr key={i}>{firstCell}{cell}</tr>;
    });
    return (
      <tbody>
        {getHeaders}
      </tbody>
    );
  }
}

TableRows.propTypes = {
  data: React.PropTypes.object.isRequired,
};

export default TableRows;
