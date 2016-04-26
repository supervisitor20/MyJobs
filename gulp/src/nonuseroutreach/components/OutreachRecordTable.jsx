import React, {Component} from 'react';
import {Table, Column, Cell} from 'fixed-data-table';

export class OutreachRecordTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableHeight: 0,
      tableWidth: 0,
      records: [
        {name: 'Fred'},
        {name: 'George'},
        {name: 'Mary'},
      ],
    };
  }

  // ajax call?
  componentDidMount() {
    this._update();
    const win = window;
    if (win.addEventListener) {
      win.addEventListener('resize', this._onResize, false);
    } else if (win.attachEvent) {
      win.attachEvent('onresize', this._onResize);
    } else {
      win.onresize = this._onResize;
    }
  }

  _onResize() {
    clearTimeout(this._updateTimer);
    this._updateTimer = setTimeout(this._update, 16);
  }

  _update() {
    const win = window;

    const widthOffset = win.innerWidth < 680 ? 0 : 500;

    this.setState({
      tableWidth: win.innerWidth - widthOffset,
      tableHeight: win.innerHeight - 200,
    });
  }

  render() {
    return (
      <Table
        rowsCount={this.state.records.length}
        rowHeight={50}
        headerHeight={50}
        width={this.state.tableWidth}
        height={this.state.tableHeight}
        {...this.props}>
        <Column
          header={<Cell>Name</Cell>}
          cell={props => (
            <Cell {...props}>
              {this.state.records[props.rowIndex].name}
            </Cell>
            )}
          width={200}
        />
      </Table>
    );
  }
}

OutreachRecordTable.propTypes = {};
