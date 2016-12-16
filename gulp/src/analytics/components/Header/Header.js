import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import {Button} from 'react-bootstrap';
import {doSetSelectedMonth} from '../../actions/calendar-actions';
import {doSetSelectedYear} from '../../actions/calendar-actions';
import {doSetSelectedDay} from '../../actions/calendar-actions';
import CalendarPanel from 'common/ui/CalendarPanel';
import RangeSelection from '../Calendar/RangeSelection';
import Calendar from '../Calendar/Calendar';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayCalendar: false,
    };
  }
  daySelected(day) {
    const {dispatch} = this.props;
    dispatch(doSetSelectedDay(day));
  }
  updateMonth(month) {
    const {dispatch} = this.props;
    dispatch(doSetSelectedMonth(month));
  }
  updateYear(year) {
    const {dispatch} = this.props;
    dispatch(doSetSelectedYear(year));
  }
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
  showCalendar() {
    this.setState({
      displayCalendar: true,
    });
  }
  render() {
    const {analytics} = this.props;
    console.log(analytics);
    const localizeTime = moment().format('LT');
    const localizeDate = moment().format('MMMM Do, YYYY');
    const day = analytics.day;
    const month = analytics.month;
    const year = analytics.year;

    const calendar = ( <CalendarPanel
                      year={year}
                      month={month}
                      day={day}
                      onYearChange={y => this.updateYear(y)}
                      onMonthChange={m => this.updateMonth(m)}
                      onSelect={d => this.daySelected(d)}
                      yearChoices={this.generateYearChoices()}
                    />);

    return (
      <div className="tabs-header">
        <nav>
          <i className="open-mobile fa fa-arrow-circle-right" aria-hidden="true"></i>
          <ul className="nav navbar-nav navbar-right right-options">
            <li>
              <Button onClick={this.showCalendar.bind(this)} className="selected-date-range-btn">
                  <i className="head-icon fa fa-calendar" aria-hidden="true"></i>
                  <span className="dashboard-date">{localizeDate} {localizeTime}</span>
              </Button>
            </li>
            <li><a href="#"><span className="head-icon fa fa-envelope-o"></span></a></li>
            <li><a href="#"><span className="head-icon fa fa-print"></span></a></li>
            <li><a href="#"><span className="head-icon fa fa-file-excel-o"></span></a></li>
          </ul>
        </nav>
        <Calendar/>
      </div>
    );
  }
}

Header.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  analytics: React.PropTypes.object.isRequired,
};

export default connect(state => ({
  analytics: state.pageLoadData,
}))(Header);
