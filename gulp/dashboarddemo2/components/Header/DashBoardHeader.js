import React from 'react';
import { Component } from 'react';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';

class DashBoardHeader extends Component {
  render() {
    const localizeTime = moment().format('LT');
    const localizeDate = moment().format('MMMM Do, YYYY');
    const h1Style = {
      fontWeight: '100',
      fontSize: '4em',
      color: '#5a6d81',
    }
    const pTitle = {
      fontWeight: '100',
      fontSize: '1.8em',
      color: '#5a6d81',
    }
    const dateStyle = {
      fontWeight: '200',
      fontSize: '2em',
      color: '#5a6d81',
      float: 'right',
      position: 'relative',
      top: '35px',
    }
    const timeStyle = {
      fontWeight: '100',
      fontSize: '2em',
      color: '#5a6d81',
      float: 'right',
      position: 'relative',
      top: '35px',
    }
    const headerStyle = {
      marginBottom: '50px',
    }

    return(
      <div style={headerStyle} id="title_header">
        <Row>
          <Col md={8}>
            <h1 style={h1Style}>Dashboard</h1>
            <p style={pTitle}>Direct Employers Community Analytics</p>
          </Col>
          <Col md={4}>
            <p style={dateStyle}>{localizeDate}</p>
            <div className="clearfix"></div>
            <p style={timeStyle}>{localizeTime}</p>
          </Col>
        </Row>
      </div>

    );
  }
}

export default DashBoardHeader;
