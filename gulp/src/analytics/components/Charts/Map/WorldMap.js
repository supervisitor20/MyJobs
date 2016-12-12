import React from 'react';
import {Component} from 'react';
import d3 from 'd3';
import mapData from 'common/resources/maps/countries';

class WorldMap extends Component {
  render() {
    const {chartData} = this.props;
    const margin = {top: 50, left: 50, right: 50, bottom: 50};
    const width = 3200 - margin.left - margin.right;
    const transform = 'translate(' + margin.left + ',' + margin.top + ')';
    const projection = d3.geo.mercator().translate([width / 2, 735]).scale(270);
    const path = d3.geo.path().projection(projection);
    const fill = (countryData) => {
      const rowData = chartData.PageLoadData.rows;
      for (let i = 0; i < rowData.length; i++) {
        if (rowData[i].country === countryData.id) {
          return '#5A6D81';
        }
      }
      return '#E6E6E6';
    };
    const paths = mapData.features.map((country, i) => {
      return (
        <path key={i} d={path(country)} className="country" stroke="#5A6D81" fill={fill(country)}></path>
      );
    });
    return (
      <div id="chart-container" style={{width: '100%'}}>
        <svg
          className="chart"
          version="1.1"
          height={1100}
          width={3200}
          viewBox="0 0 3200 1100"
          preserveAspectRatio="xMinYMin meet"
         >
         <g transform={transform}>
           {paths}
         </g>
         </svg>
      </div>
    );
  }
}

WorldMap.propTypes = {
  chartData: React.PropTypes.object.isRequired,
};

export default WorldMap;
