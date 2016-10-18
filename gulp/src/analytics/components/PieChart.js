import React from 'react';
import PiePaths from './PiePaths';

const PieChart = React.createClass({
  propTypes: {
    svgHeight: React.PropTypes.number,
    svgWidth: React.PropTypes.number,
  },
  getDefaultProps() {
    return {
      svgHeight: 700,
      svgWidth: 700,
    };
  },
  render() {
    return (
      <svg
        height={this.props.svgHeight}
        width={this.props.svgWidth}
        >
        <PiePaths
          width={600}
          height={400}
        />
      </svg>
    );
  },
});

export default PieChart;
