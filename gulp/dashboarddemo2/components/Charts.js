import React from 'react';
import { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import DateRangePicker from './DateRangePicker';
import StackedAreaChart from './StackedAreaChart';
import SimpleBarChart from './SimpleBarChart';
import SimpleRadarChart from './RadarChart';

class Charts extends Component {
  constructor(props, context){
    super(props, context);
  }
  render(){
    return(
      <Row>
        <div id="charts">
          <Row>
            <Col md={4}>
              <div className="chart-title">
                <h2>Hits By Page</h2>
              </div>
            </Col>
            <Col md={8}>
              <DateRangePicker/>
            </Col>
          </Row>
          <hr/>
            <Row>
              <Col md={12}>
                <SimpleBarChart/>
                <SimpleRadarChart/>
              </Col>
            </Row>
        </div>
      </Row>
    );
  }
}

export default Charts;
