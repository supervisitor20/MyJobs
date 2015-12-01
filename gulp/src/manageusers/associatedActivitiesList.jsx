import React from 'react';

const AssociatedActivitiesList = React.createClass({
  propTypes: {
    activities: React.PropTypes.array.isRequired,
  },
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
  },
});

export default AssociatedActivitiesList;
