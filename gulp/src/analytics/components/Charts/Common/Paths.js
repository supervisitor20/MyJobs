import React from 'react';
import {Component} from 'react';

class Paths extends Component {
  render() {
    return (
      <path d={this.props.d} fill={this.props.fill} stroke={this.props.stroke} className={this.props.class}></path>
    );
  }
}

Paths.propTypes = {
  d: React.PropTypes.string.isRequired,
  fill: React.PropTypes.string,
  stroke: React.PropTypes.string,
  class: React.PropTypes.string,
};

export default Paths;
