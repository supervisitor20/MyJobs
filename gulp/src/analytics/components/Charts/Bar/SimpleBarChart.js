import React from 'react';
import {Component} from 'react';
import {BarChart} from 'react-d3-basic';
import d3 from 'd3';

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
      const x = d => d.found_on;
      return (
        <div id="bar_chart" style={{
          width: '100%'}}>
          <BarChart
            width={1600}
            height={400}
            chartSeries={chartSeries}
            x={x}
            categoricalColors={d3.scale.category10().range(['#5a6d81'])}
            data={axisData}
            xScale="ordinal"
            xLabel="Found On" />
        </div>
      );
    }
}

SimpleBarChart.propTypes = {
  chartData: React.PropTypes.object.isRequired,
};

export default SimpleBarChart;
