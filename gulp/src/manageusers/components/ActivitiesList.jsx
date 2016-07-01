import React from 'react';

class ActivitiesList extends React.Component {
  render() {
    return (
      <div className="activities-wrapper">
        {this.props.tablesOfActivitiesByApp}
      </div>
    );
  }
}

ActivitiesList.propTypes = {
  tablesOfActivitiesByApp: React.PropTypes.array.isRequired,
};

export default ActivitiesList;
