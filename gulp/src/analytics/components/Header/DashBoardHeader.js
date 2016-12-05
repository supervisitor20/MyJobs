import React from 'react';
import {Component} from 'react';
import {Row, Col} from 'react-bootstrap';

class DashBoardHeader extends Component {
  render() {
    return (
        <div id="title_header">
          <Row>
            <Col md={12}>
              <h1 className="dashboard-title">Analytics</h1>
              <p className="dashboard-sub-title">Direct Employers Community Analytics</p>
            </Col>
          </Row>
        </div>
    );
  }
}

export default DashBoardHeader;
