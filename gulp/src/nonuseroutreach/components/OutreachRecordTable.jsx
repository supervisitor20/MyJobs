import React, {Component} from 'react';
var ReactDOM = require('react-dom');
import {Table, Column, Cell} from 'fixed-data-table';
import _ from 'lodash-compat';

export class OutreachRecordTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableHeight: 0,
      tableWidth: 0,
      records: [
        {
          date: '01/01/2016',
          inbox: 'testinbox@test.com',
          from: 'outreachdude@test.com',
          body: 'Reach out to a dude that...',
          state: 'Reviewed'
        },
        {
          date: '01/01/2016',
          inbox: 'testinbox@test.com',
          from: 'outreachdude@test.com',
          body: 'Reach out to a dude that...',
          state: 'Reviewed'
        },
        {
          date: '01/01/2016',
          inbox: 'testinbox@test.com',
          from: 'outreachdude@test.com',
          body: 'Reach out to a dude that...',
          state: 'Reviewed'
        },
        {
          date: '01/01/2016',
          inbox: 'testinbox@test.com',
          from: 'outreachdude@test.com',
          body: 'Reach out to a dude that...',
          state: 'Reviewed'
        },
      ],
    };
  }

  // ajax call?
  componentDidMount() {
    this._update();
    const win = window;
    if (win.addEventListener) {
      win.addEventListener('resize', _.debounce(() => this._update(), 16), false);
    } else if (win.attachEvent) {
      win.attachEvent('onresize', _.debounce(() => this._update(), 16));
    } else {
      win.onresize = () => _.debounce(this._update(), 16);
    }
  }

  _update() {
    const win = window;
    this.setState({
      tableWidth: ReactDOM.findDOMNode(this._container_div).getBoundingClientRect().width || 10,
      tableHeight: win.innerHeight - 200,
    });
  }

  render() {
    return (
      <div ref={(c) => this._container_div = c}>
      <Table
        rowsCount={this.state.records.length}
        rowHeight={50}
        headerHeight={50}
        width={this.state.tableWidth}
        height={this.state.tableHeight}
        {...this.props}>
        <Column
          header={<Cell>Date</Cell>}
          cell={props => (
            <Cell {...props}>
              {this.state.records[props.rowIndex].date}
            </Cell>
            )}
          width={90}
        />
        <Column
          header={<Cell>Inbox</Cell>}
          cell={props => (
            <Cell {...props}>
              {this.state.records[props.rowIndex].inbox}
            </Cell>
            )}
          width={200}
        />
        <Column
          header={<Cell>From</Cell>}
          cell={props => (
            <Cell {...props}>
              {this.state.records[props.rowIndex].from}
            </Cell>
            )}
          width={200}
        />
        <Column
          header={<Cell>Body</Cell>}
          cell={props => (
            <Cell {...props}>
              {this.state.records[props.rowIndex].body}
            </Cell>
            )}
          width={200}
        />
        <Column
          header={<Cell>Action State</Cell>}
          cell={props => (
            <Cell {...props}>
              {this.state.records[props.rowIndex].state}
            </Cell>
            )}
          width={150}
        />
      </Table>
      </div>
    );
  }
}

OutreachRecordTable.propTypes = {};
