import d3 from 'd3';
import React from 'react';
import Axis from '../Common/Axis';
import Grid from '../Common/Grid';

const LineChart = React.createClass({
  getDefaultProps(){
    return {
      svgHeight: 600,
      svgWidth: 1920,
      svgId: 'line_svg'
    };
  },
  render(){
    const margin = { top: 20, bottom: 100, left: 80, right: 20 },
          height = this.props.svgHeight - margin.top - margin.bottom,
          width = this.props.svgWidth - margin.left - margin.right,
          transform = 'translate(' + margin.left + ',' + margin.top + ')',
          interpolations = [
            "linear",
            "step-before",
            "step-after",
            "basis",
            "basis-closed",
            "cardinal",
            "cardinal-closed"
          ],
          data = [
            {"day":"2016/10/10", "hits": 476},
            {"day":"2016/10/11", "hits": 678},
            {"day":"2016/10/12", "hits": 567},
            {"day":"2016/10/13", "hits": 425},
            {"day":"2016/10/14", "hits": 387},
            {"day":"2016/10/15", "hits": 1025},
            {"day":"2016/10/16", "hits": 978},
            {"day":"2016/10/17", "hits": 376},
            {"day":"2016/10/18", "hits": 267},
            {"day":"2016/10/19", "hits": 1167},
            {"day":"2016/10/20", "hits": 729},
            {"day":"2016/10/21", "hits": 644},
            {"day":"2016/10/22", "hits": 402},
            {"day":"2016/10/23", "hits": 915}
          ],
          dateParser = d3.time.format('%Y/%m/%d').parse,
          yScale = d3.scale.linear()
                      .domain([0, d3.max(data, (d) => {
                        return d.hits;
                      })])
                      .range([height, 0]),
          xScale = d3.time.scale()
                      .domain(d3.extent(data, (d) => {
                        const date = dateParser(d.day);
                        return date;
                      }))
                      .range([0,  width]),
          xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .ticks(d3.time.days, 1)
                    .tickFormat(d3.time.format("%a")),
          yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left'),
          yGrid = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .tickSize(-width, 0, 0)
                    .tickFormat(""),
          xGrid = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .tickSize(-height, 0, 0)
                    .tickFormat(""),
          line = d3.svg.line()
                    .x((d) => {
                      const date = dateParser(d.day);
                      return xScale(date);
                    })
                    .y((d) => {
                      return yScale(d.hits);
                    }),
          cx = (d) => {
            const date = dateParser(d.day);
            return xScale(date);
          },
          cy = (d) => {
            return yScale(d.hits);
          },
          circle = (data).map((d, i) => {
            return(
                <circle
                  r={2}
                  key={i}
                  cx={cx(d)}
                  cy={cy(d)}
                />
            )
          });

    return(
      <div id="chart-container" style={{width: '100%'}}>
        <svg
          id={this.props.svgId}
          height={this.props.svgHeight}
          width={this.props.svgWidth}
          viewBox="0 0 1920 600"
          style={{width: '100%', minWidth: '250px', height: 'auto'}}
          preserveAspectRatio="xMinYMin meet"
        >
          <g transform={transform}>
            <Grid height={height} grid={yGrid} gridType="y"/>
            <Axis height={height} width={width} axis={xAxis} axisType="x" />
            <Axis height={height} axis={yAxis} axisType="y" />
            <path className="path" d={line(data)} strokeLinecap="round"/>
            {circle}
          </g>
        </svg>
      </div>
    );
  }
});

export default LineChart;
