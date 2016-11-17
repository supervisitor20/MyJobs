import React, { Component } from 'react';
import { Calendar, DateRange, defaultRanges } from 'react-date-range';

class DateRangePicker extends Component {
    constructor(props, context){
      super(props, context);
      this.state = {
           'rangePicker' : {},
           'linked' : {},
           'datePicker' : null,
           'firstDayOfWeek' : null,
           'predefined' : {},
           showCalendar: false
         }
         this.showCalendar = this.showCalendar.bind(this);
    }
    handleSelect(range){
        console.log(range);
    }
    handleChange(which, payload) {
        this.setState({
        [which] : payload
      });
    }
    showCalendar() {
      this.setState({
        showCalendar: !this.state.showCalendar
      });
    }
    render(){
      const { rangePicker, linked, datePicker, firstDayOfWeek, predefined} = this.state;
      const format = 'dddd, D MMMM YYYY';
      const today = new Date();
      const dd = today.getDate();
      const mm = today.getMonth()+1;
      const yyyy = today.getFullYear();

      const todayDate = mm+'/'+dd+'/'+yyyy;
        return (
            <div>
              <div className="date-display-boxes">
                <span className="start-date-input">
                <input
                  className="date-box"
                  onClick={this.showCalendar}
                  placeholder={todayDate}
                  type='text'
                  readOnly
                  value={ predefined['startDate'] && predefined['startDate'].format(format).toString() }
                />
              <i className="calendar-icon-start fa fa-calendar"></i>
              </span>
              <span className="end-date-input">
                <input
                  className="date-box"
                  onClick={this.showCalendar}
                  placeholder={todayDate}
                  type='text'
                  readOnly
                  value={ predefined['endDate'] && predefined['endDate'].format(format).toString() }
                />
              <i className="calendar-icon-end fa fa-calendar"></i>
              </span>
              </div>
              {this.state.showCalendar ?
                <DateRange
                    linkedCalendars={ false }
                    ranges={ defaultRanges }
                    onInit={ this.handleChange.bind(this, 'predefined') }
                    onChange={ this.handleChange.bind(this, 'predefined') }
                    theme={{
                      Calendar : { width: 200 },
                      PredefinedRanges : { marginLeft: 10, marginTop: 10 }
                    }}
                />
              : ""}
            </div>
        )
    }
}

export default DateRangePicker;
