import React from 'react';
import { Component } from 'react';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';

class DashBoardHeader extends Component {
  render() {
    const localizeTime = moment().format('LT');
    const localizeDate = moment().format('MMMM Do, YYYY');
    return(
        <div id="title_header">
          <Row>
            <Col md={8}>
              <h1 className="dashboard-title">Analytics</h1>
              <p className="dashboard-sub-title">Direct Employers Community Analytics</p>
            </Col>
            <Col md={4}>
              <p className="dashboard-date">{localizeDate}</p>
              <div className="clearfix"></div>
              <p className="dashboard-time">{localizeTime}</p>
            </Col>
          </Row>
        </div>
    );
  }
}

export default DashBoardHeader;
