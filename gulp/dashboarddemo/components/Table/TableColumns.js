import React from 'react';

class TableColumns extends React.Component {
  render(){
    const col = this.props.data;
    const colHeaders = col.tableHeader.map((colData, i) => {
        return(
          <th key={colData.key}>{colData.label}</th>
        );
      return colHeaders;
    });
    return(
      <thead>
        <tr>{colHeaders}</tr>
      </thead>
    );
  }
}

export default TableColumns;
