import React from 'react';
import ActivitiesList from './activitiesList';

class Activities extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Activities</h2>
          </div>
          <div className="product-card-full no-highlight">
            <ActivitiesList activitiesTableRows={this.props.activitiesTableRows} />
          </div>
        </div>
      </div>
    );
  }
}

Activities.propTypes = {
  activitiesTableRows: React.PropTypes.array.isRequired,
};

Activities.defaultProps = {
  activitiesTableRows: [],
};

export default Activities;
