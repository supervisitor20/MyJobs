import React from 'react';
import { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import SimpleBarChart from './SimpleBarChart';

class TitleCharts extends Component {
  constructor(props, context){
    super(props, context);
  }
  render(){
    return(
        <div id="charts">
          <Row>
            <Col md={12}>
              <div className="chart-title">
                <h2>Movie Titles</h2>
              </div>
            </Col>
          </Row>
          <hr/>
            <Row>
              <Col md={12}>
                <SimpleBarChart/>
              </Col>
            </Row>
        </div>
    );
  }
}

export default TitleCharts;
