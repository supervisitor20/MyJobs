import React from 'react';
import TextField from './TextField';
import CalendarPanel from './CalendarPanel';
import ClickOutHandler from 'react-onclickout';
import moment from 'moment';

/**
 * DateField.jsx is a textbox with a calendar button. The button launches the
 * popup calendar CalendarPanel.jsx.
 *
 * To use in an app, pass in onChange as a callback. Detect which element (e.g.
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
      const momentObject = moment(value, 'YYYY/MM/DD');
      day = momentObject.date();
      month = momentObject.month() + 1;
      year = momentObject.year();
    }
    this.state = {
      year: year,
      month: month,
      day: day,
      displayCalendar: false,
      dateInvalid: false,
    };
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

    const momentObject = moment(value, 'YYYY/MM/DD');
    const day = momentObject.date();
    const month = momentObject.month() + 1;
    const year = momentObject.year();

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
                      closeCalendar={() => this.closeCalendar()}
                      yearChoices={this.generateYearChoices(50)}
                      />
                  </div>);
    }

    let error;
    // Date value must match ISO 8601 format
    if (moment(value, 'YYYY/MM/DD', true).isValid() === false) {
      error = (
        <div className="error-text">Date formatting error</div>
      );
    }

    return (
      <ClickOutHandler onClickOut={e => this.closeCalendar(e, this)}>
        <div>
          <TextField
            id={name}
            name={name}
            className="datepicker-input"
            maxLength={maxLength}
            required={required}
            hidden={isHidden}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={e => this.toggleCalendar(e, this)}
          />
        </div>
        {error}
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
  autoFocus: React.PropTypes.string,
};

DateField.defaultProps = {
  placeholder: '',
  value: '',
  maxLength: null,
  isHidden: false,
  required: false,
  autoFocus: '',
};

export default DateField;
