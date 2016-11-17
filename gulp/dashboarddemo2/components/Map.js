import d3 from 'd3';
import React from 'react';
import $ from 'jQuery';

const Map = React.createClass({
  propTypes: {
    svgHeight: React.PropTypes.number,
    svgWidth: React.PropTypes.number,
  },
  getDefaultProps() {
    return {
      svgHeight: 550,
      svgWidth: 1500,
    };
  },
  render() {
    const path = d3.geo.path();
    const colors = d3.scale.linear()
    .range(['rgb(255,255,178)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(240,59,32)','rgb(189,0,38)']);
    const salesData = [
  {
    "state": "Alabama",
    "sales": 305010.8395
  },
  {
    "state": "Arizona",
    "sales": 249113.82
  },
  {
    "state": "Arkansas",
    "sales": 223888.0825
  },
  {
    "state": "California",
    "sales": 1372210.208
  },
  {
    "state": "Colorado",
    "sales": 323632.227
  },
  {
    "state": "Connecticut",
    "sales": 102924.0675
  },
  {
    "state": "Delaware",
    "sales": 10925.658
  },
  {
    "state": "Florida",
    "sales": 777663.933
  },
  {
    "state": "Georgia",
    "sales": 325851.9375
  },
  {
    "state": "Idaho",
    "sales": 217594.2235
  },
  {
    "state": "Illinois",
    "sales": 959327.289
  },
  {
    "state": "Indiana",
    "sales": 466670.475
  },
  {
    "state": "Iowa",
    "sales": 199228.4655
  },
  {
    "state": "Kansas",
    "sales": 257860.9765
  },
  {
    "state": "Kentucky",
    "sales": 153164.5175
  },
  {
    "state": "Louisiana",
    "sales": 173758.413
  },
  {
    "state": "Massachusettes",
    "sales": 242050.504
  },
  {
    "state": "Maine",
    "sales": 235916.904
  },
  {
    "state": "Maryland",
    "sales": 347458.2825
  },
  {
    "state": "Michigan",
    "sales": 475170.81
  },
  {
    "state": "Minnesota",
    "sales": 490009.91
  },
  {
    "state": "Mississippi",
    "sales": 97623.535
  },
  {
    "state": "Missouri",
    "sales": 256711.0175
  },
  {
    "state": "Montana",
    "sales": 76071.983
  },
  {
    "state": "Nebraska",
    "sales": 116331.303
  },
  {
    "state": "Nevada",
    "sales": 52063.3545
  },
  {
    "state": "New Hampshire",
    "sales": 95608.5305
  },
  {
    "state": "New Jersey",
    "sales": 328234.077
  },
  {
    "state": "New Mexico",
    "sales": 158989.0105
  },
  {
    "state": "New York",
    "sales": 738894.19
  },
  {
    "state": "North Carolina",
    "sales": 335759.138
  },
  {
    "state": "North Dakota",
    "sales": 48157.994
  },
  {
    "state": "Ohio",
    "sales": 729426.1495
  },
  {
    "state": "Oklahoma",
    "sales": 176368.408
  },
  {
    "state": "Oregon",
    "sales": 354325.1835
  },
  {
    "state": "Pennsylvania",
    "sales": 357586.6305
  },
  {
    "state": "Rhode Island",
    "sales": 50820.4795
  },
  {
    "state": "South Carolina",
    "sales": 137837.2795
  },
  {
    "state": "South Dakota",
    "sales": 75172.774
  },
  {
    "state": "Tennessee",
    "sales": 240460.999
  },
  {
    "state": "Texas",
    "sales": 863891.026
  },
  {
    "state": "Utah",
    "sales": 234200.4255
  },
  {
    "state": "Vermont",
    "sales": 99602.641
  },
  {
    "state": "Virginia",
    "sales": 379200.684
  },
  {
    "state": "Washington",
    "sales": 560356.4275
  },
  {
    "state": "West Virginia",
    "sales": 77018.357
  },
  {
    "state": "Wisconsin",
    "sales": 314266.8
  },
  {
    "state": "Wyoming",
    "sales": 51190.883
  }
];
      colors.domain([
        0, d3.max(salesData, (d) => {
          return d.sales;
        })
      ]);
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
    for(let i = 0; i < salesData.length; i++) {
      let salesState = salesData[i].state;
      let salesValue = parseFloat(salesData[i].sales);
      for(let j = 0; j < getJSONData.features.length; j++) {
        let usState = getJSONData.features[j].properties.NAME;
        if(salesState === usState){
          getJSONData.features[j].properties.value = salesValue;
          break;
        }
      }
    }
    const fill = (d) => {
      const value = d.properties.value;
      if(value) {
        return colors(value);
      }else {
        return '#666';
      }
    };
    const paths = (getJSONData.features).map((d, i) => {
      console.log(d);
      return (
        <path key={i} d={path(d)} style={{fill:fill(d)}}/>
      );
    });
    return (
      <svg
        height={this.props.svgHeight}
        width={this.props.svgWidth}
      >
      {paths}
      </svg>
    );
  },
});

export default Map;
