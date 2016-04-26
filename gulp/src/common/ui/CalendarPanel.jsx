import React, {Component, PropTypes} from 'react';
import {map} from 'lodash-compat/collection';
import {calendarDays} from 'common/calendar-support';
import Select from 'common/ui/Select';
import classnames from 'classnames';
import {getDisplayForValue} from '../array.js';

export default class CalendarPanel extends Component {
  renderDayHeader(name) {
    return (
      <th key={name}>{name}</th>
    );
  }
  renderDay(day) {
    const {onSelect} = this.props;
    const className = classnames({
      dim: day.siblingMonth,
      selected: day.selected,
    });
    const dayEvent = {year: day.year, month: day.month, day: day.day};

    return (
      <td
        key={day.day}
        className={className}
        onClick={() => onSelect(dayEvent)}>
        {day.day}
      </td>
    );
  }
  render() {
    const {
      year,
      month,
      yearChoices,
      monthChoices,
      onYearChange,
      onMonthChange,
    } = this.props;
    const weeks = calendarDays(year, month);
    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    return (
      <div className="calendar-panel">
        <div className="row">
          <div className="col-xs-6">
            <Select
              name="month"
              value={getDisplayForValue(this.props.monthChoices, (month + 1))}
              choices={monthChoices}
              onChange={e => onMonthChange(e.target.value)}
              />
          </div>
          <div className="col-xs-6">
            <Select
              name="year"
              value={year.toString()}
              choices={yearChoices}
              onChange={e => onYearChange(e.target.value)}
              />
          </div>
        </div>
        <table className="calendar-table">
          <thead>
            <tr>
              {map(dayNames, n => this.renderDayHeader(n))}
            </tr>
          </thead>
          <tbody>
          { map(weeks, (week, i) => (
            <tr key={i}>
              {map(week, day => this.renderDay(day))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  }
}

CalendarPanel.defaultProps = {
  monthChoices: [
    {value: 1, display: 'January'},
    {value: 2, display: 'February'},
    {value: 3, display: 'March'},
    {value: 4, display: 'April'},
    {value: 5, display: 'May'},
    {value: 6, display: 'June'},
    {value: 7, display: 'July'},
    {value: 8, display: 'August'},
    {value: 9, display: 'September'},
    {value: 10, display: 'October'},
    {value: 11, display: 'November'},
    {value: 12, display: 'December'},
  ],
};

CalendarPanel.propTypes = {
  /**
   * Year
   */
  year: PropTypes.number.isRequired,
  /**
   * Dynamic, see generateYearChoices() in Date.jsx
   */
  yearChoices: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
    })
  ),
  /**
   * Month
   */
  month: PropTypes.number.isRequired,
  /**
   * The 12 months
   */
  monthChoices: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      display: PropTypes.string.isRequired,
    })
  ),
  /**
   * Callback: the user has selected an item.
   *
   * obj: the object selected by the user.
   */
  onSelect: PropTypes.func.isRequired,
  /**
   * Callback: the user has selected an item.
   *
   * obj: the object selected by the user.
   */
  onYearChange: PropTypes.func.isRequired,
  /**
   * Callback: the user has selected an item.
   *
   * obj: the object selected by the user.
   */
  onMonthChange: PropTypes.func.isRequired,
};
