import React from 'react';
import {Component} from 'react';
import {Row, Col} from 'react-bootstrap';
import SimpleBarChart from './SimpleBarChart';

class ChartContainer extends Component {
  constructor(props, context) {
    super(props, context);
  }
  render() {
    const {chartData} = this.props;
    return (
        <div id="charts">
          <Row>
            <Col md={12}>
              <div className="chart-title">
                <h2>Job Views By Browser</h2>
              </div>
            </Col>
          </Row>
          <hr/>
            <Row>
              <Col md={12}>
                <SimpleBarChart chartData={chartData}/>
              </Col>
            </Row>
        </div>
    );
  }
}

ChartContainer.propTypes = {
  chartData: React.PropTypes.object.isRequired,
};

export default ChartContainer;
