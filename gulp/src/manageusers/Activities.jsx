import React from 'react';
import ActivitiesList from './ActivitiesList';

class Activities extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Activities</h2>
          </div>
          <div className="product-card-full no-highlight">
            <ActivitiesList tablesOfActivitiesByApp={this.props.tablesOfActivitiesByApp} />
          </div>
        </div>
      </div>
    );
  }
}

Activities.propTypes = {
  tablesOfActivitiesByApp: React.PropTypes.array.isRequired,
};

Activities.defaultProps = {
  tablesOfActivitiesByApp: [],
};

export default Activities;
