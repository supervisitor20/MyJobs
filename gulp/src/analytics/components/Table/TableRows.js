import React from 'react';
import ReactDOM from 'react-dom';
import {applyFilter} from '../../main';

class TableRows extends React.Component {
  render(){
    const rowData = this.props.data.rows;
    const columnData = this.props.data.column_names;
    const originalHeader = [];
    const modHeader = [];
    columnData.map((colData) => {
      originalHeader.push(colData);
      modHeader.push(colData);
    });
    originalHeader.shift();
    const mod = modHeader.splice(0, 1);
    const getHeaders = rowData.map((item, i) => {
      const firstCell = mod.map((colData, i) => {
        return(
          <td key={i}><a onClick={this.props.applyFilter} href="#">{item[colData.key]}</a></td>
        );
      });
      const cell = originalHeader.map((colData, i) => {
        return(
          <td key={i}>{item[colData.key]}</td>
        );
      });

      return <tr key={i}>{firstCell}{cell}</tr>;
    });
    return(
      <tbody>
        {getHeaders}
      </tbody>
    );
  }
}

export default TableRows;
