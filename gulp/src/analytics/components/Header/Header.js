import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import {Button} from 'react-bootstrap';
import CalendarPanel from 'common/ui/CalendarPanel';

class Header extends Component {
  constructor(props) {
    super(props);
    let year;
    let month;
    let day;

    const momentObject = moment('YYYY-MM-DD');
    day = momentObject.date();
    month = momentObject.month();
    year = momentObject.year();

    this.state = {
      year: year,
      month: month,
      day: day,
      displayCalendar: true,
      dateInvalid: false,
    };
  }
  onMouseInCalendar(value) {
    this.setState({mouseInCalendar: value});
  }
  // updateYear(year) {
  //   const {onChange, value} = this.props;
  //
  //   if (!moment(value, 'MM/DD/YYYY', true).isValid()) {
  //     this.resetDateToNow();
  //   }
  //
  //   const fakeEvent = {};
  //   fakeEvent.target = {};
  //   fakeEvent.target.name = this.props.name;
  //   fakeEvent.target.type = 'calendar-year';
  //   fakeEvent.target.value = year;
  //   onChange(fakeEvent);
  // }
  // onDaySelect(day) {
  //   this.updateDay(day);
  //   this.closeCalendar();
  // }
  generateYearChoices() {
    const now = new Date();
    const numberOfYears = 50;
    let offset = 0;
    // how many years should come before and after the current year
    const pivot = numberOfYears % 2 === 0 ? numberOfYears - 1 : numberOfYears;
    offset = Math.floor(pivot / 2);
    const startYear = now.getFullYear() + offset;

    const yearChoices = [];
    for (let i = 0; i < numberOfYears; i++) {
      yearChoices.push({
        value: (startYear - i),
        display: (startYear - i).toString(),
      });
    }
    return yearChoices;
  }
  // updateDay(day) {
  //   const {onChange, value} = this.props;
  //
  //   if (!moment(value, 'MM/DD/YYYY', true).isValid()) {
  //     this.resetDateToNow();
  //   }
  //
  //   const fakeEvent = {};
  //   fakeEvent.target = {};
  //   fakeEvent.target.name = this.props.name;
  //   fakeEvent.target.type = 'calendar-day';
  //   fakeEvent.target.value = day.day;
  //   onChange(fakeEvent);
  // }
  // updateMonth(month) {
  //   const {onChange, value} = this.props;
  //
  //   if (!moment(value, 'MM/DD/YYYY', true).isValid()) {
  //     this.resetDateToNow();
  //   }
  //
  //   const fakeEvent = {};
  //   fakeEvent.target = {};
  //   fakeEvent.target.name = this.props.name;
  //   fakeEvent.target.type = 'calendar-month';
  //   fakeEvent.target.value = month;
  //   onChange(fakeEvent);
  // }

  // updateYear(year) {
  //   const {onChange, value} = this.props;
  //
  //   if (!moment(value, 'MM/DD/YYYY', true).isValid()) {
  //     this.resetDateToNow();
  //   }
  //
  //   const fakeEvent = {};
  //   fakeEvent.target = {};
  //   fakeEvent.target.name = this.props.name;
  //   fakeEvent.target.type = 'calendar-year';
  //   fakeEvent.target.value = year;
  //   onChange(fakeEvent);
  // }
  openCalendar() {
    const {value} = this.props;
    // Check if date is valid
    // If not, replace with what it was on page load (what was passed in or today's date
    if (!moment(value, 'MM/DD/YYYY', true).isValid()) {
      this.resetDateToNow();
    }
    this.setState({displayCalendar: true});
  }
  closeCalendar() {
    this.setState({displayCalendar: false});
  }
  render() {
    const localizeTime = moment().format('LT');
    const localizeDate = moment().format('MMMM Do, YYYY');
    const dateObject = new Date();
    const day = dateObject.getDay();
    const month = dateObject.getMonth();
    const year = dateObject.getFullYear();

    // Handle error message
    // let errorMessage;
    // if (error) {
    //   errorMessage = error;
    // }

    // let errorComponent;
    // if (errorMessage) {
    //   errorComponent = (
    //     <div className="error-text">{errorMessage}</div>
    //   );
    // }
    let calendar;
    if (this.state.displayCalendar) {
      calendar = ( <CalendarPanel
                      year={year}
                      yearChoices={this.generateYearChoices()}
                      month={month}
                      day={day}
                      onSelect={d => console.log('Select Change', d)}
                      onYearChange={y => console.log('Year Change', y)}
                      onMonthChange={m => console.log('Month Change', m)}
                    />);
    }
    return (
      <div className="tabs-header">
        <nav>
          <i className="open-mobile fa fa-arrow-circle-right" aria-hidden="true"></i>
          <ul className="nav navbar-nav navbar-right right-options">
            <li>
              <Button onClick={() => this.onMouseInCalendar(true)} className="selected-date-range-btn">
                  <i className="head-icon fa fa-calendar" aria-hidden="true"></i>
                  <span className="dashboard-date">{localizeDate} {localizeTime}</span>
              </Button>
            </li>
            <li><a href="#"><span className="head-icon fa fa-envelope-o"></span></a></li>
            <li><a href="#"><span className="head-icon fa fa-print"></span></a></li>
            <li><a href="#"><span className="head-icon fa fa-file-excel-o"></span></a></li>
          </ul>
        </nav>
        {calendar}
      </div>
    );
  }
}

Header.propTypes = {
  // onChange: React.PropTypes.func.isRequired,
  /**
   * Value at first page load
   */
  value: React.PropTypes.string,
  /**
   * Should this component be shown or not?
   */
  isHidden: React.PropTypes.bool,
  /**
   * Should this bad boy focus, all auto like?
   */
  autoFocus: React.PropTypes.string,
  /**
   * Validation error
   */
  error: React.PropTypes.string,

  /**
  * How many years to include in the year selection
  */
  numberOfYears: React.PropTypes.number,
  /** Whether or not to only include past years. When false, the current year
  * is used as a pivot and half of the selectable years will fall before, and
  * half of them will fall after it.
  */
  pastOnly: React.PropTypes.bool,
};

export default connect(state => ({
  analytics: state.pageLoadData,
}))(Header);
