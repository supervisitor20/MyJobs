import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import {switchMainDimension} from '../../actions/sidebar-action';
import SideBarDimension from './SideBarDimensionList';

class SideBar extends Component {
  constructor(props) {
    super(props);
  }
  activeDimension() {
    const {dispatch} = this.props;
    dispatch(switchMainDimension());
  }
  render() {
    const dimensions = [
      {name: 'Demographics'},
      {name: 'Geo'},
      {name: 'Technology'},
      {name: 'Mobile'},
    ];
    const dimension = dimensions.map((dim, i) => {
      return (
        <SideBarDimension active={this.activeDimension.bind(this)} key={i} dimension={dim} />
      );
    });
    return (
      <div id="menu">
        <ul className="sidebar-container">
          <li className="side-dimension-header">
            <p className="filter-header">Primary Dimensions</p>
            <div className="clearfix"></div>
           </li>
          {dimension}
        </ul>
      </div>
    );
  }
}

SideBar.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
};

export default connect(state => ({
  analytics: state.pageLoadData,
}))(SideBar);
