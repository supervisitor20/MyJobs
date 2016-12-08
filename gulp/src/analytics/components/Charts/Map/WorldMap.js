import d3 from 'd3';
import React from 'react';
import {Component} from 'react';
import mapData from 'common/resources/maps/countries';

class WorldMap extends Component {
  render() {
    const margin = {top: 50, left: 50, right: 50, bottom: 50},
    height = 1100 - margin.top - margin.bottom,
    width = 3200 - margin.left - margin.right,
    svgHeight = height + margin.top + margin.bottom,
    svgWidth = width + margin.left + margin.right,
    transform = 'translate(' + margin.left + ',' + margin.top + ')',
    projection = d3.geo.mercator().translate([width / 2, 735]).scale(265),
    path = d3.geo.path().projection(projection),
    groups = mapData.features.map((group, i) => {
      return (
        <path key={i} d={path(group)} className="area" fill="#5a6d81"></path>
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
           {groups}
         </g>
         </svg>
      </div>
    );
  }
}

export default WorldMap;
