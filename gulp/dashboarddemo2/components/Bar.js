import d3 from 'd3';
import React from 'react';
import Axis from './Axis';
import Grid from './Grid';

const Bar = React.createClass({
  propTypes: {
    svgHeight: React.PropTypes.number,
    svgWidth: React.PropTypes.number,
    svgId: React.PropTypes.string,
  },
  getDefaultProps() {
    return {
      svgHeight: 400,
      svgWidth: 1500,
      svgId: 'bar_svg',
    };
  },
  render() {
    const margin = {top: 20, bottom: 100, left: 80, right: 20};
    const height = this.props.svgHeight - margin.top - margin.bottom;
    const width = this.props.svgWidth - margin.left - margin.right;
    const transform = 'translate(' + margin.left + ',' + margin.top + ')';
    const data = [
      {'day': 'Mon', 'hits': 476},
      {'day': 'Tue', 'hits': 678},
      {'day': 'Wed', 'hits': 567},
      {'day': 'Thur', 'hits': 425},
      {'day': 'Fri', 'hits': 387},
      {'day': 'Sat', 'hits': 1025},
      {'day': 'Sun', 'hits': 978},
    ];
    const colorPicker = () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };
    const xScale = d3.scale.ordinal()
    .domain(data.map((d) => {
      return d.day;
    }))
    .rangeBands([0, width]);
    const yScale = d3.scale.linear()
    .domain([0, d3.max(data, (d) => {
      return d.hits;
    })])
    .range([height, 0]);
    const xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom');
    const yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left');
    const yGrid = d3.svg.axis()
    .scale(yScale)
    .orient('left')
    .tickSize(-width, 0, 0)
    .tickFormat('');
    const rectColor = (d) => {
      return colorPicker(d.hits);
    };
    const rectHeight = (d) => {
      return height - yScale(d.hits);
    };
    const rectWidth = () => {
      return xScale.rangeBand() - 10;
    };
    const x = (d) => {
      return xScale(d.day);
    };
    const y = (d) => {
      return yScale(d.hits);
    };
    const rect = (data).map((d, i) => {
      return (
        <rect
          fill={rectColor(d)}
          x={x(d, i)}
          y={y(d, i)}
          key={i}
          height={rectHeight(d)}
          width={rectWidth(d)}
        />
    );
    });
    return (
      <svg
        id={this.props.svgId}
        height={this.props.svgHeight}
        width={this.props.svgWidth}
      >
         <g transform={transform}>
           <Grid height={height} grid={yGrid} gridType="y"/>
           <Axis height={height} width={width} axis={xAxis} axisType="x" />
           <Axis height={height} axis={yAxis} axisType="y" />
           {rect}
        </g>
      </svg>
    );
  },
});

export default Bar;
