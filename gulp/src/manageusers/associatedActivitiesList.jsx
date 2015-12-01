import React from 'react';

class AssociatedActivitiesList extends React.Component {
  render() {
    const associatedActivitiesList = this.props.activities.map(function(activity, index) {
      return (
        <li key={index}>
          {activity.fields.name}
        </li>
      );
    });
    return (
      <ul>
        {associatedActivitiesList}
      </ul>
    );
  }
}

AssociatedActivitiesList.propTypes = {
  activities: React.PropTypes.array.isRequired,
};

export default AssociatedActivitiesList;
