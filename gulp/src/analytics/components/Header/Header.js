import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import {Button} from 'react-bootstrap';
import Calendar from '../Calendar/Calendar';

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPicker: false,
    };
  }
  showCalendarRangePicker() {
    this.setState({
      showPicker: true,
    });
  }
  render() {
    const localizeTime = moment().format('LT');
    const localizeDate = moment().format('MMMM Do, YYYY');
    return (
      <div className="tabs-header">
        <nav>
          <i className="open-mobile fa fa-arrow-circle-right" aria-hidden="true"></i>
          <ul className="nav navbar-nav navbar-right right-options">
            <li>
              <Button onClick={this.showCalendarRangePicker.bind(this)} className="selected-date-range-btn">
                  <i className="head-icon fa fa-calendar" aria-hidden="true"></i>
                  <span className="dashboard-date">{localizeDate} {localizeTime}</span>
              </Button>
            </li>
            <li><a href="#"><span className="head-icon fa fa-envelope-o"></span></a></li>
            <li><a href="#"><span className="head-icon fa fa-print"></span></a></li>
            <li><a href="#"><span className="head-icon fa fa-file-excel-o"></span></a></li>
          </ul>
        </nav>
        <Calendar showCalendarRangePicker={this.state.showPicker}/>
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
