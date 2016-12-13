import React from 'react';
import {Component} from 'react';

class Paths extends Component {
  render() {
    const {showToolTip, hideToolTip} = this.props;
    return (
      <path onMouseEnter={showToolTip} onMouseLeave={hideToolTip} d={this.props.d} fill={this.props.fill} stroke={this.props.stroke} className={this.props.class}></path>
    );
  }
}

Paths.propTypes = {
  d: React.PropTypes.string.isRequired,
  fill: React.PropTypes.string,
  stroke: React.PropTypes.string,
  class: React.PropTypes.string,
  showToolTip: React.PropTypes.func,
  hideToolTip: React.PropTypes.func,
};

export default Paths;
