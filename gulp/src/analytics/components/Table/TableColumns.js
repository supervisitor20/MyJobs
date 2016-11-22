import React from 'react';

class TableColumns extends React.Component {
  render(){
    const { data } = this.props;
    const col = data.column_names;
    const colHeaders = col.map((colData, i) => {
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
