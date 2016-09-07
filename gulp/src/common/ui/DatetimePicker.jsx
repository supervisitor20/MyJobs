import React, {Component, PropTypes} from 'react';
import {range, map} from 'lodash-compat/collection';
import SelectControls from 'common/ui/SelectControls';
import {hoursArray, monthsArray} from 'common/calendar-support'
export default class DateTimePicker extends Component {
  constructor() {
    super();
    const {initialValue} = this.props;
    this.state = getDefaultState();
    if (initialValue) this.stringToState(initialValue);
  }

  getDefaultState() {
    const today = new Date();
    return {
      selectMonth: today.getMonth()+1,
      selectDay: today.getDate(),
      selectYear: today.getFullYear(),
      yearRangeMax: today.getFullYear()+2,
      yearRangeMin: today.getFullYear()-20,
    };
  }
  stringToState(input) {
    const re = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/i;
    const matchValues = re.exec(input);

    this.setState({
      selectYear: matchValues[0],
      selectDay: matchValues[1],
      selectMonth: matchValues[2],
      selectHour: matchValues[3],
      selectMinute: matchValues[4],
    });
  }

  handleFieldChange(field, value) {
    this.setState({
      [field]: value
    });
  }

  fieldsToString() {
    const {selectYear, selectDay, selectMonth,
      selectHour, selectMinute} = this.state;
    return selectYear + "-" + selectDay + "-" +
      selectMonth + " " + selectHour + ":" + selectMinute;
  }

  render() {
    const {selectYear, selectMonth, selectDay,
      selectHour, selectMinute, yearRangeMin, yearRangeMax} = this.state;
    return (
      <div>
        <SelectControls
          choices={map(hoursArray, (a) => ({...a, render: () => ''}))}
          value={selectMonth}
          onSelect={v => handleFieldChange("selectMonth", v)}/>
        <SelectControls
          choices={map(range(1, 31), (n) => ({value: n, display: n, render: () => ''}))}
          value={selectDay}
          onSelect={v => handleFieldChange("selectDay", v)}/>
        <SelectControls
          choices={map(range(yearRangeMin, yearRangeMax),
            (n) => ({value: n, display: n, render: () => ''}))
          }
          value={selectYear}
          onSelect={v => handleFieldChange("selectYear", v)}/>
        <SelectControls
          choices={map(hoursArray, (a) => ({...a, render: () => ''}))}
          value={selectHour}
          onSelect={v => handleFieldChange("selectHour", v)}/>
        <SelectControls
          choices={map(range(1, 60), (n) => ({value: n, display: n, render: () => ''}))}
          value={selectMinute}
          onSelect={v => handleFieldChange("selectMinute", v)}/>
      </div>
    );
  }
}

DateTimePicker.defaultProps = {
  initialValue: "",
};

DateTimePicker.propTypes = {
  /**
   * what to do when a field changes
   */
  onChange: PropTypes.func.isRequired,

  /**
   * initial value for the display in regex parseable string
   * format: MM/DD/YYYY HH:MM:SS --- NOTE: Review this, ensure correct format
   */
  initialValue: PropTypes.string,
};
