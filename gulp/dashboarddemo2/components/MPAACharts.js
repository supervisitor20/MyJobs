import React from 'react';
import { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import DateRangePicker from './DateRangePicker';
import SimplePieChart from './PieChart';

class MPAACharts extends Component {
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
                <h2>MPAA Ratings</h2>
              </div>
            </Col>
            <Col md={8}>
              <DateRangePicker/>
            </Col>
          </Row>
          <hr/>
            <Row>
              <Col md={12}>
                <SimplePieChart/>
              </Col>
            </Row>
        </div>
      </Row>
    );
  }
}

export default MPAACharts;
