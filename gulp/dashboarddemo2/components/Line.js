import d3 from 'd3';
import React from 'react';
import Axis from './Axis';
import Grid from './Grid';
import ToolTip from './ToolTip';

const Line = React.createClass({
  propTypes: {
    svgHeight: React.PropTypes.number,
    svgWidth: React.PropTypes.number,
    svgId: React.PropTypes.string,
  },
  getDefaultProps() {
    return {
      svgHeight: 450,
      svgWidth: 800,
      svgId: 'line_svg',
    };
  },
  getInitialState(){
        return {
            tooltip:{ display:false,data:{key:'',value:''}},
        };
    },
  showToolTip(e){
    e.target.setAttribute('fill', '#000000');

    this.setState({tooltip:{
        display:true,
        data: {
            value:e.target.getAttribute('data-value')
            },
        pos:{
            x:e.target.getAttribute('cx'),
            y:e.target.getAttribute('cy')
        }

        }
    });
},
hideToolTip(e){
    e.target.setAttribute('fill', '#7dc7f4');
    this.setState({tooltip:{ display:false,data:{key:'',value:''}}});
},
  render() {
    const margin = {top: 20, bottom: 100, left: 80, right: 20};
    const height = this.props.svgHeight - margin.top - margin.bottom;
    const width = this.props.svgWidth - margin.left - margin.right;
    const transform = 'translate(' + margin.left + ',' + margin.top + ')';
    const data = [
      {'day': '2016/10/10', 'hits': 476},
      {'day': '2016/10/11', 'hits': 678},
      {'day': '2016/10/12', 'hits': 567},
      {'day': '2016/10/13', 'hits': 425},
      {'day': '2016/10/14', 'hits': 387},
      {'day': '2016/10/15', 'hits': 1025},
      {'day': '2016/10/16', 'hits': 978},
      {'day': '2016/10/17', 'hits': 376},
      {'day': '2016/10/18', 'hits': 267},
      {'day': '2016/10/19', 'hits': 1167},
      {'day': '2016/10/20', 'hits': 729},
      {'day': '2016/10/21', 'hits': 644},
      {'day': '2016/10/22', 'hits': 402},
      {'day': '2016/10/23', 'hits': 915},
    ];
    const dateParser = d3.time.format('%Y/%m/%d').parse;
    const yScale = d3.scale.linear()
      .domain([0, d3.max(data, (d) => {
        return d.hits;
      })])
      .range([height, 0]);
    const xScale = d3.time.scale()
      .domain(d3.extent(data, (d) => {
        const date = dateParser(d.day);
        return date;
      }))
      .range([0, width]);
    const xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(d3.time.days, 1)
      .tickFormat(d3.time.format('%a'));
    const yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left');
    const yGrid = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .tickSize(-width, 0, 0)
      .tickFormat('');
    const line = d3.svg.line()
      .x((d) => {
        const date = dateParser(d.day);
        return xScale(date);
      })
      .y((d) => {
        return yScale(d.hits);
      });
    const cx = (d) => {
      const date = dateParser(d.day);
      return xScale(date);
    };
    const cy = (d) => {
      return yScale(d.hits);
    };
    const circle = (data).map((d, i) => {
      return (
        <circle
          r={4}
          key={i}
          cx={cx(d)}
          cy={cy(d)}
          data-value={d.hits}
          onMouseEnter={this.showToolTip}
          onMouseLeave={this.hideToolTip}
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
          <path className="path" d={line(data)} strokeLinecap="round"/>
          {circle}
          <ToolTip tooltip={this.state.tooltip}/>
        </g>
      </svg>
    );
  },
});

export default Line;
