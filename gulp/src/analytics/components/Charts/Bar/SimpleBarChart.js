import React from 'react';
import {Component} from 'react';
import {BarChart} from 'react-d3-basic';

class SimpleBarChart extends Component {
    render() {
      const {chartData} = this.props;
      const axisData = chartData.PageLoadData.rows;
      const chartSeries = [
        {
          field: 'job_views',
          name: 'Job Views',
        },
      ];
      const x = d => d.browser;
      return (
        <div id="bar_chart" style={{
          width: '100%'}}>
          <BarChart
            width={1600}
            height={500}
            chartSeries={chartSeries}
            x = {x}
            data={axisData}
            xScale="ordinal"
            xLabel="Browser" />
        </div>
      );
    }
}

SimpleBarChart.propTypes = {
  chartData: React.PropTypes.object.isRequired,
};

export default SimpleBarChart;
