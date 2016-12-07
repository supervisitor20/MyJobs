import React from 'react';
import {Component} from 'react';
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import {Button} from 'react-bootstrap';

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
      },
      startDate: moment().subtract(29, 'days'),
      endDate: moment(),
    };
  }
  handleEvent(event, picker) {
    this.setState({
      startDate: picker.startDate,
      endDate: picker.endDate,
    });
  }
  applyDateRange() {
    console.log('APPLY');
    console.log('START: ' + this.state.startDate, 'END: ' + this.state.endDate);
  }
  cancelDateRange() {
    console.log('CANCELED');
  }
  render() {
    const localizeTime = moment().format('LT');
    const localizeDate = moment().format('MMMM Do, YYYY');
    return (
      <div>
        <DateRangePicker opens="left" onApply={this.applyDateRange.bind(this)} onCancel={this.cancelDateRange.bind(this)} startDate={this.state.startDate} endDate={this.state.endDate} ranges={this.state.ranges} onEvent={this.handleEvent.bind(this)}>
          <Button className="selected-date-range-btn">
              <i className="head-icon fa fa-calendar" aria-hidden="true"></i>
              <span className="dashboard-date">{localizeDate} {localizeTime}</span>
          </Button>
        </DateRangePicker>
      </div>
    );
  }
}

export default Calendar;
