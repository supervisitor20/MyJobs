import React from 'react';
import {Component} from 'react';
import d3 from 'd3';
import mapData from 'common/resources/maps/us';

class USAMap extends Component {
  render() {
    // const {chartData} = this.props;
    const margin = {top: 50, left: 50, right: 50, bottom: 50};
    const width = 3200 - margin.left - margin.right;
    const projection = d3.geo.albersUsa()
            .scale(2000)
            .translate([width / 2, 450]);
    const path = d3.geo.path()
          .projection(projection);
    const color = d3.scale.linear().domain([1, 100])
          .range(['rgb(236,231,242)', 'rgb(166,189,219)', 'rgb(43,140,190)']);

    // generate chloropleth values
    function randomizer(d) {
      for (let i = 0; i < d.features.length; i++) {
        const random = Math.floor(Math.random() * 100);
        d.features[i].properties.chloropleth = random;
      }
    }
    randomizer(mapData);
    const fill = (d) => {
      const chloropleth = d.properties.chloropleth;
      if (chloropleth) {
        return color(chloropleth);
      }
      return '#666666';
    };
    const paths = mapData.features.map((state, i) => {
      return (
        <path key={i} d={path(state)} className="country" fill={fill(state)}></path>
      );
    });
    return (
      <div id="chart-container" style={{width: '100%'}}>
        <svg
          className="chart"
          version="1.1"
          height={1000}
          width={3200}
          viewBox="0 0 3200 1000"
          preserveAspectRatio="xMinYMin meet"
         >
         {paths}
         </svg>
      </div>
    );
  }
}

USAMap.propTypes = {
  chartData: React.PropTypes.object.isRequired,
};

export default USAMap;
