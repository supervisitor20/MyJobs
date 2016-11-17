import React from 'react';

class TableRows extends React.Component {
  render(){
    const data = this.props.data;
    const headers = data.table.map((item) => {
      let cells = data.tableHeader.map((colData, i) => {
        return(
          <td key={colData.key}>{item[colData.key]}</td>
        );
      });
      return <tr key={item.id}>{cells}</tr>;
    });
    return(
      <tbody>
        {headers}
      </tbody>
    );
  }
}

export default TableRows;
