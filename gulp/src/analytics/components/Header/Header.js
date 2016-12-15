import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import DateField from 'common/ui/DateField';
import CalendarPanel from 'common/ui/CalendarPanel';

class Header extends Component {
  logIt() {
    console.log('HELLO WORLD');
  }
  render() {
    return (
      <div className="tabs-header">
        <nav>
          <i className="open-mobile fa fa-arrow-circle-right" aria-hidden="true"></i>
          <ul className="nav navbar-nav navbar-right right-options">
            <li><a href="#"><span className="head-icon fa fa-envelope-o"></span></a></li>
            <li><a href="#"><span className="head-icon fa fa-print"></span></a></li>
            <li><a href="#"><span className="head-icon fa fa-file-excel-o"></span></a></li>
          </ul>
        </nav>
        <DateField
          name='Calendar'
          onChange={e => this.logIt()}
          required={true}
          value='25'
          maxLength={7}
          isHidden={false}
          placeholder='Calendar'
          autoFocus='Date'
          numberOfYears={50}
          disable={false}
          pastOnly
          />
        <div style={{marginBottom: '200px'}}>
        <CalendarPanel
            year={2016}
            yearChoices={[2015, 2016]}
            month={12}
            day={15}
            onSelect={e => console.log('On Select', e)}
            onYearChange={e => console.log('On Year', e)}
          />
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  analytics: state.pageLoadData,
}))(Header);
