import d3 from 'd3';
import React from 'react';

const PiePaths = React.createClass({
  render() {
    const data = [
      {'day': 'Mon', 'hits': 476},
      {'day': 'Tue', 'hits': 678},
      {'day': 'Wed', 'hits': 567},
      {'day': 'Thur', 'hits': 425},
      {'day': 'Fri', 'hits': 387},
      {'day': 'Sat', 'hits': 1025},
      {'day': 'Sun', 'hits': 978},
    ];
    const arc = d3.svg.arc()
    .outerRadius(0)
    .innerRadius(300);
    const pie = d3.layout.pie()
    .value((d) => {
      return d.hits;
    });
    const color = d3.scale.ordinal()
    .range([
      '#' + Math.floor(Math.random() * 16777215).toString(16),
      '#' + Math.floor(Math.random() * 16777215).toString(16),
      '#' + Math.floor(Math.random() * 16777215).toString(16),
      '#' + Math.floor(Math.random() * 16777215).toString(16),
      '#' + Math.floor(Math.random() * 16777215).toString(16),
      '#' + Math.floor(Math.random() * 16777215).toString(16),
    ]);
    const transform = 'translate(400, 300)';
    const paths = (pie(data)).map((d, i) => {
      return (
        <path fill={color(i)} d={arc(d)} key={i}/>
      );
    });
    return (
      <g transform={transform}>
        {paths}
      </g>
    );
  },
});

export default PiePaths;
