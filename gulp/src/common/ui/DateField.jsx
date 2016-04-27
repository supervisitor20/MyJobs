import React from 'react';
import TextField from './TextField';
import CalendarPanel from './CalendarPanel';
import ClickOutHandler from 'react-onclickout';

/**
 * DateField.jsx is a textbox with a calendar button. The button launches the
 * popup calendar CalendarPanel.jsx.
 *
 * To use in an app, pas in onChange as a callback. Detect which element (e.g.
 * day, month, year) was changed by checking event.target.type. For example,
 * if the user selects a day then event.target.type === 'calendar-day'.
 * 
 * The selected value is in event.target.value.
 */

class DateField extends React.Component {
  constructor(props) {
    super(props);
    let year;
    let month;
    let day;
    const value = this.props.value;
    if (value) {
      year = parseInt(value.substring(0, 5), 10);
      month = parseInt(value.substring(5, 7), 10);
      day = parseInt(value.substring(8, 10), 10);
    }
    this.state = {
      year: year,
      month: month,
      day: day,
      displayCalendar: false,
    };
    this.closeCalendar = this.closeCalendar.bind(this);
  }
  onDaySelect(day) {
    const {onChange} = this.props;
    const fakeEvent = {};
    fakeEvent.target = {};
    fakeEvent.target.name = this.props.name;
    fakeEvent.target.type = 'calendar-day';
    fakeEvent.target.value = day.day;
    onChange(fakeEvent);
    this.closeCalendar();
  }
  onMonthSelect(month) {
    const {onChange} = this.props;
    const fakeEvent = {};
    fakeEvent.target = {};
    fakeEvent.target.name = this.props.name;
    fakeEvent.target.type = 'calendar-month';
    fakeEvent.target.value = month;
    onChange(fakeEvent);
  }
  onYearSelect(year) {
    const {onChange} = this.props;
    const fakeEvent = {};
    fakeEvent.target = {};
    fakeEvent.target.name = this.props.name;
    fakeEvent.target.type = 'calendar-year';
    fakeEvent.target.value = year;
    onChange(fakeEvent);
  }
  generateYearChoices(numberOfYears) {
    const now = new Date();
    const currentYear = now.getFullYear();

    const yearChoices = [];
    for (let i = 0; i < numberOfYears; i++) {
      yearChoices.push({value: (currentYear - i), display: (currentYear - i).toString()});
    }
    return yearChoices;
  }
  closeCalendar() {
    this.setState({displayCalendar: false});
  }
  openCalendar() {
    this.setState({displayCalendar: true});
  }
  toggleCalendar() {
    this.setState({displayCalendar: !this.state.displayCalendar});
  }
  render() {
    const {
      name,
      onChange,
      required,
      maxLength,
      isHidden,
      value,
      placeholder} = this.props;
    const year = parseInt(value.substring(0, 5), 10);
    const month = parseInt(value.substring(5, 7), 10);
    const day = parseInt(value.substring(8, 10), 10);
    let calendar;
    if (this.state.displayCalendar) {
      calendar = (<div className="input-group datepicker-dropdown dropdown-menu">
                    <CalendarPanel
                      year={year}
                      month={month - 1}
                      day={day}
                      onYearChange={y => this.onYearSelect(y)}
                      onMonthChange={m => this.onMonthSelect(m)}
                      onSelect={d => this.onDaySelect(d)}
                      closeCalendar={this.closeCalendar}
                      yearChoices={this.generateYearChoices(50)}
                      />
                  </div>);
    }

    return (
      <ClickOutHandler onClickOut={e => this.closeCalendar(e, this)}>
        <div className="input-group">
          <TextField
            id={name}
            name={name}
            className=""
            maxLength={maxLength}
            required={required}
            hidden={isHidden}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onSelect={e => this.openCalendar(e, this)}
          />
          <div className="input-group-addon" onClick={e => this.toggleCalendar(e, this)}>
            <span className="glyphicon glyphicon-calendar"></span>
          </div>
        </div>
        {calendar}
      </ClickOutHandler>
    );
  }
}

DateField.propTypes = {
  /**
  * Callback: the user edited this field
  *
  * obj: change event
  */
  onChange: React.PropTypes.func.isRequired,
  /**
   * under_score_seperated, unique name of this field. Used to post form
   * content to Django
   */
  name: React.PropTypes.string.isRequired,
  /**
   * Placeholder text for the input control
   */
  placeholder: React.PropTypes.string,
  /**
   * Value at first page load
   */
  value: React.PropTypes.string,
  /**
   * Number of characters allowed in this field
   */
  maxLength: React.PropTypes.number,
  /**
   * Should this component be shown or not?
   */
  isHidden: React.PropTypes.bool,
  /**
   * Must this field have a value before submitting form?
   */
  required: React.PropTypes.bool,
  /**
   * Should this bad boy focus, all auto like?
   */
  autoFocus: React.PropTypes.bool,
};

DateField.defaultProps = {
  placeholder: '',
  value: '',
  maxLength: null,
  isHidden: false,
  required: false,
  autoFocus: false,
};

export default DateField;
