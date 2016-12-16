import React from 'react';
import {Component} from 'react';
import moment from 'moment';

class RangeSelection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ranges: [
        {name: 'Today', date: [moment(), moment()]},
        {name: 'Yesterday', date: [moment().subtract(1, 'days'), moment().subtract(1, 'days')]},
        {name: 'Last 7 Days', date: [moment().subtract(6, 'days'), moment()]},
        {name: 'Last 30 Days', date: [moment().subtract(29, 'days'), moment()]},
        {name: 'This Month', date: [moment().startOf('month'), moment().endOf('month')]},
        {name: 'Last Month', date: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]},
      ],
    };
  }
  render() {
    const {setRange} = this.props;
    const generateRanges = this.state.ranges.map((range, i) => {
      return (
        <li key={i} className="range" onClick={() => setRange(range.date)}>{range.name}</li>
      );
    });
    return (
      <div className="range-container">
        <ul className="range-selections">
          {generateRanges}
          <li className="range">Custom Range</li>
          <li className="apply-cancel"><button className="range-btn apply-range">APPLY</button><button className="range-btn cancel-range">CANCEL</button></li>
        </ul>
      </div>
    );
  }
}

export default RangeSelection;
