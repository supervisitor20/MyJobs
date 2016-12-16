import React from 'react';
import {Component} from 'react';
import moment from 'moment';
import RangeSelection from './RangeSelection';

class Calendar extends Component {
  constructor(props) {
    super(props);

  }
  setRangeSelection(y) {
    console.log(y);
  }
  render() {
    return (
      <div className="calendar-container">
        <RangeSelection setRange={y => this.setRangeSelection(y)}/>
      </div>
    );
  }
}

export default Calendar;
