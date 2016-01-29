import React from 'react';

import {formatActivityName} from 'util/formatActivityName';

class AssociatedActivitiesList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const assignedActivities = [];
    // The API gives activities grouped by app_access
    // Assemble simple list of all assigned_activities, no matter the app_access
    const activities_grouped_by_app_access = this.props.activities;
    for (const i in activities_grouped_by_app_access) {
      const assigned_activities = activities_grouped_by_app_access[i].assigned_activities;
      for (const j in assigned_activities) {
        const formattedActivityName = formatActivityName(assigned_activities[j].name);
        assignedActivities.push(formattedActivityName);
      }
    }

    // TODO actually make this a "short" list, meaning show 3-4 and a "more" button
    const associatedActivitiesShortList = assignedActivities.map( (activity, index) => {
      return (
        <li key={index}>
          {assignedActivities[index]}
        </li>
      );
    });

    return (
      <ul>
        {associatedActivitiesShortList}
      </ul>
    );
  }
}

AssociatedActivitiesList.propTypes = {
  activities: React.PropTypes.array.isRequired,
};

export default AssociatedActivitiesList;
