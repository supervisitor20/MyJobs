import React from 'react';
import {map} from 'lodash-compat/collection';
import {calendarDays} from 'common/calendar-support';
import Select from 'common/ui/Select';
import classnames from 'classnames';
import {getDisplayForValue} from '../array.js';

/**
 * Calendar popup. Used by DateField.jsx
 */
export default class CalendarPanel extends React.Component {
  renderDayHeader(name) {
    return (
      <th key={name}>{name}</th>
    );
  }
  renderDay(currentDay) {
    const {onSelect, day} = this.props;

    currentDay.selected = ((currentDay.day === day) && (currentDay.siblingMonth !== true)) ? true : false;

    const className = classnames({
      dim: currentDay.siblingMonth,
      selected: currentDay.selected,
    });

    const dayEvent = {year: currentDay.year, month: currentDay.month, day: currentDay.day};

    return (
      <td
        key={currentDay.day}
        className={className}
        onClick={() => onSelect(dayEvent)}>
        {currentDay.day}
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
              {map(week, currentDay => this.renderDay(currentDay))}
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
  year: React.PropTypes.number.isRequired,
  /**
   * Dynamic, see generateYearChoices() in DateField.jsx
   */
  yearChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  /**
   * Month
   */
  month: React.PropTypes.number.isRequired,
  /**
   * The 12 months
   */
  monthChoices: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      value: React.PropTypes.any.isRequired,
      display: React.PropTypes.string.isRequired,
    })
  ),
  /**
   * Day
   */
  day: React.PropTypes.number.isRequired,
  /**
   * Callback: the user has selected an item.
   *
   * obj: the object selected by the user.
   */
  onSelect: React.PropTypes.func.isRequired,
  /**
   * Callback: the user has selected an item.
   *
   * obj: the object selected by the user.
   */
  onYearChange: React.PropTypes.func.isRequired,
  /**
   * Callback: the user has selected an item.
   *
   * obj: the object selected by the user.
   */
  onMonthChange: React.PropTypes.func.isRequired,
};
