import React, {Component} from 'react';
import {Table, Column, Cell} from 'fixed-data-table';

export class OutreachRecordTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        {name: 'Fred'},
        {name: 'George'},
        {name: 'Mary'},
      ],
    };
  }

  // ajax call?

  render() {
    return (
      <Table
        rowsCount={this.state.data.length}
        rowHeight={50}
        headerHeight={50}
        width={200}
        maxHeight={400}
        {...this.props}>
        <Column
          header={<Cell>Name</Cell>}
          cell={props => (
            <Cell {...props}>
              {this.state.data[props.rowIndex].name}
            </Cell>
            )}
          width={200}
        />
      </Table>
    );
  }
}

OutreachRecordTable.propTypes = {};
