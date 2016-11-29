import d3 from 'd3';
import React from 'react';
import Axis from '../Common/Axis';
import Grid from '../Common/Grid';

const BarChart = React.createClass({
  getDefaultProps() {
    return {
      svgHeight: 600,
      svgWidth: 1920,
      svgId: 'bar_svg',
    };
  },
  render() {
    const margin = {top: 20, bottom: 100, left: 80, right: 20};
    const height = this.props.svgHeight - margin.top - margin.bottom;
    const width = this.props.svgWidth - margin.left - margin.right;
    const transform = 'translate(' + margin.left + ',' + margin.top + ')';
    const dayHits = [
      {'day': 'Mon', 'hits': 325},
      {'day': 'Tue', 'hits': 678},
      {'day': 'Wed', 'hits': 125},
      {'day': 'Thur', 'hits': 425},
      {'day': 'Fri', 'hits': 520},
      {'day': 'Sat', 'hits': 1285},
      {'day': 'Sun', 'hits': 978},
    ];
    const colorPicker = () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };
    const xScale = d3.scale.ordinal()
    .domain(dayHits.map((d) => {
      return d.day;
    }))
    .rangeBands([0, width]);
    const yScale = d3.scale.linear()
    .domain([0, d3.max(dayHits, (d) => {
      return d.hits;
    })])
    .range([height, 0]);
    const xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom');
    const yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(8)
    .orient('left');
    const yGrid = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .ticks(8)
    .tickSize(-width, 10, 0)
    .tickFormat('');
    const rectColor = (d) => {
      return colorPicker(d.hits);
    };
    const rectHeight = (d) => {
      return height - yScale(d.hits);
    };
    const rectWidth = () => {
      return xScale.rangeBand() - 50;
    };
    const x = (d) => {
      return xScale(d.day);
    };
    const y = (d) => {
      return yScale(d.hits);
    };
    const rect = (dayHits).map((d, i) => {
      return (
        <rect
          fill="#5a6d81"
          x={x(d, i)}
          y={y(d, i)}
          key={i}
          height={rectHeight(d)}
          width={rectWidth(d)}
        />
    );
    });

    return (
      <div className="chart-container" style={{width: '100%'}}>
        <svg
          className="chart"
          height={this.props.svgHeight}
          width={this.props.svgWidth}
          version="1.1"
          style={{width: '100%', minWidth: '250px', height: 'auto'}}
          viewBox="0 0 1920 600"
          preserveAspectRatio="xMinYMin meet"
        >
           <g transform={transform}>
             <Grid height={height} grid={yGrid} gridType="y"/>
             <Axis height={height} width={width} axis={xAxis} axisType="x" />
             <Axis height={height} axis={yAxis} axisType="y" />
             {rect}
          </g>
        </svg>
      </div>
    );
  },
});

export default BarChart;
