import React, {PropTypes, Component} from 'react';
import DateField from '../../common/ui/DateField';
import moment from 'moment';

// TODO rip this out into a generalized begin/end dual Datefield
export class WizardFilterDateRange extends Component {
    constructor() {
      super();
    }

    updateField(event, field) {
      let finalValue;
      const today = moment().format('MM/DD/YYYY');
      const rawExistingDate = this.props[field];
      const existingDate = rawExistingDate ? rawExistingDate : today;
      if (event.target.type === 'calendar-month') {
        // month must be 2 chars
        const newMonth = (event.target.value < 10) ? '0' + event.target.value : event.target.value;
        // If user mangled date string, reset it so we can use substring
        const afterMonth = existingDate.substring(2, 10);
        const updatedDate = newMonth + afterMonth;
        finalValue = updatedDate;
      } else if (event.target.type === 'calendar-day') {
        // day must be 2 chars
        const newDay = (event.target.value < 10) ? '0' + event.target.value : event.target.value;
        // If user mangled date string, reset it so we can use substring
        const beforeDay = existingDate.substring(0, 3);
        const afterDay = existingDate.substring(5, 10);
        finalValue = beforeDay + newDay + afterDay;
      } else if (event.target.type === 'calendar-year') {
        const newYear = event.target.value;
        // If user mangled date string, reset it so we can use substring
        const beforeYear = existingDate.substring(0, 6);
        finalValue = beforeYear + newYear;
      }

      if (finalValue) {
        const {updateFilter} = this.props;
        const newState = {...this.state};

        if (field === 'begin') {
          newState.begin = finalValue;
          newState.end = this.props.end;
        } else if (field === 'end') {
          newState.begin = this.props.begin;
          newState.end = finalValue;
        }
        this.setState(newState);
        updateFilter([newState.begin, newState.end]);
      }
    }

    render() {
      // End date should be after begin date
      let error;
      const beginDateObject = moment(this.props.begin, 'MM/DD/YYYY');
      const endDateObject = moment(this.props.end, 'MM/DD/YYYY');
      if (endDateObject.isBefore(beginDateObject)) {
        error = 'End date must be the same or after begin date';
      }

      return (
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <DateField
              onChange={e => this.updateField(e, 'begin')}
              placeholder="begin date"
              value={this.props.begin}
              />
          </div>
          <div className="col-xs-12 col-md-6">
            <DateField
              onChange={e => this.updateField(e, 'end')}
              placeholder="end date"
              value={this.props.end}
              error={error}
              />
          </div>
        </div>
      );
    }
}

WizardFilterDateRange.propTypes = {
  id: PropTypes.string.isRequired,
  updateFilter: PropTypes.func.isRequired,
  begin: PropTypes.string,
  end: PropTypes.string,
};
