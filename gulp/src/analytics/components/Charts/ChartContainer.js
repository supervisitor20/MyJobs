import React from 'react';
import {Component} from 'react';
import {Row, Col} from 'react-bootstrap';
// import BarChart from './Bar/BarChart';
import WorldMap from './Map/WorldMap';
import USAMap from './Map/USAMap';

class ChartContainer extends Component {
  constructor(props, context) {
    super(props, context);
  }
  render() {
    const {chartData} = this.props;
    const chartDisplay = chartData.PageLoadData.column_names[0].key;
    let chartType;
    switch (chartDisplay) {
    case 'country':
      chartType = <WorldMap width={1920} height={700} chartData={chartData} />;
      break;
    case 'state':
      chartType = <USAMap chartData={chartData} />;
      break;
    default:
      chartType = <WorldMap chartData={chartData} />;
    }
    return (
        <div id="charts">
          <Row>
            <Col md={12}>
              <div className="chart-title">
                <h2>Job Locations</h2>
              </div>
            </Col>
          </Row>
          <hr/>
            <Row>
              <Col md={12}>
                {chartType}
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
