import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import {doSetSelectedMonth} from '../../actions/calendar-actions';
import {doSetSelectedYear} from '../../actions/calendar-actions';
import {doSetSelectedDay} from '../../actions/calendar-actions';
import CalendarPanel from 'common/ui/CalendarPanel';
import RangeSelection from './RangeSelection';

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayCalendar: false,
    };
  }
  setRangeSelection(range) {
    console.log(range);
    // const startRange = range[0];
    // const endRange = range[1];
    // dispatch(doSetSelectedRange(startRange, endRange));
  }
  showCalendar() {
    this.setState({
      displayCalendar: true,
    });
  }
  updateMonth(month) {
    const {dispatch} = this.props;
    dispatch(doSetSelectedMonth(month));
    console.log(month);
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
  daySelected(day) {
    const {dispatch} = this.props;
    dispatch(doSetSelectedDay(day));
  }
  showRange() {
    console.log('SHOWING');
  }
  render() {
    const {analytics} = this.props;
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
      <div className="calendar-container">
        <ul>
          <li className="calendar-pick full-calendar">
            {calendar}
          </li>
          <li className="calendar-pick quick-calendar">
            <RangeSelection showCustomRange={() => this.showRange()} setRange={y => this.setRangeSelection(y)}/>
          </li>
        </ul>
      </div>
    );
  }
}

Calendar.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  analytics: React.PropTypes.object.isRequired,
};

export default connect(state => ({
  analytics: state.pageLoadData,
}))(Calendar);
