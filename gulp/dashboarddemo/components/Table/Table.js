import React from 'react';
import { Component } from 'react';

class Table extends Component {
  render(){
    const { data, id } = this.props;
    const childProps = React.Children.map(this.props.children, (child) => React.cloneElement(child, {
        data: data,
      })
    );

    return(
        <table id="analytics_data_table" className={"analytics-table " + id}>
          {childProps}
        </table>
    );
  }
}

export default Table;
