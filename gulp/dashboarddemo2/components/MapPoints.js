import d3 from 'd3';
import React from 'react';
import $ from 'jQuery';

const MapPoints = React.createClass({
  propTypes: {
    svgHeight: React.PropTypes.number,
    svgWidth: React.PropTypes.number,
  },
  getDefaultProps() {
    return {
      svgHeight: 800,
      svgWidth: 1000,
    };
  },
  render() {

                //Width and height
                var w = 1000;
                var h = 800;

                //Define map projection
                var projection = d3.geo.albersUsa()
                                       .translate([w/2, h/2])
                                       .scale([1000]);

                //Define path generator
                var path = d3.geo.path()
                                 .projection(projection);
               const getJSONData = (() => {
                       let jsonData = null;
                       $.ajax({
                           'async': false,
                           'global': false,
                           'url': 'us.json',
                           'dataType': 'json',
                           'success': (data) => {
                               jsonData = data;
                           }
                       });
                       return jsonData;
               })();
               const getSalesData = (() => {
                       let jsonData = null;
                       $.ajax({
                           'async': false,
                           'global': false,
                           'url': 'sales-by-city.json',
                           'dataType': 'json',
                           'success': (data) => {
                               jsonData = data;
                           }
                       });
                       return jsonData;
               })();
               const cx = function(d){
                 return projection([d.lon, d.lat])[0];
               };
               const cy = function(d){
                 return projection([d.lon, d.lat])[1];
               };
               const radius = function(d){
                 return Math.sqrt(parseInt(d.sales)* 0.00005);
               };
               const paths = (getJSONData.features).map((d, i) => {
                 return (
                   <path key={i} d={path(d)} fill={'#000'}/>
                 );
               });
               const circles = (getSalesData.salesProjections).map((d, i) => {
                 return(
                   <circle
                     r={2}
                     key={i}
                     cx={cx(d)}
                     cy={cy(d)}
                     style={{fill:'red'}}
                    />
                 );
               });

    return (
      <svg
        height={this.props.svgHeight}
        width={this.props.svgWidth}
      >
      {paths}
      {circles}
      </svg>
    );
  },
});

export default MapPoints;
