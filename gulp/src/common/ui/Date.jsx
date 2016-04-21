import React from 'react';
import TextField from './TextField';
import CalendarPanel from './CalendarPanel';
import ClickOutHandler from 'react-onclickout';

/**
 * Date.jsx is a textbox with a Date widget button.
 *
 * It wraps CalendarPanel.jsx, which is the popup calendar.
 *
 * To use this component in an app, you'll need to handle callbacks which
 * handle events this component can trigger:
 *
 * event.target.name = calendar-day
 * event.target.name = calendar-month
 * event.target.name = calendar-year
 *
 */

class Date extends React.Component {
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
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      day = now.getDate();
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
  // Leaving here in case we want shift the month (e.g. with left/right arrows)
  onMonthShift(shift) {
    let {month, year} = this.state;

    if (shift < 0) {
      if (month === 0) {
        year -= 1;
        month = 11;
      } else {
        month -= 1;
      }
    }

    if (shift > 0) {
      if (month === 11) {
        year += 1;
        month = 0;
      } else {
        month += 1;
      }
    }

    this.setState({
      month: month,
      year: year,
    });
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

Date.propTypes = {
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

Date.defaultProps = {
  placeholder: '',
  value: '',
  maxLength: null,
  isHidden: false,
  required: false,
  autoFocus: false,
};

export default Date;
