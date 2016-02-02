import React from 'react';

import {formatActivityName} from 'util/formatActivityName';

class AssociatedActivitiesList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const assignedActivitiesFormatted = [];
    // The API gives activities grouped by app_access
    // Assemble simple list of all assigned_activities, no matter the app_access
    const activitiesGroupedByAppAccess = this.props.activities;
    for (const i in activitiesGroupedByAppAccess) {
      if (activitiesGroupedByAppAccess.hasOwnProperty(i)) {
        const assignedActivities = activitiesGroupedByAppAccess[i].assigned_activities;
        for (const j in assignedActivities) {
          if (assignedActivities.hasOwnProperty(j)) {
            const formattedActivityName = formatActivityName(assignedActivities[j].name);
            assignedActivitiesFormatted.push(formattedActivityName);
          }
        }
      }
    }
    // TODO actually make this a "short" list, meaning show 3-4 and a "more" button
    const associatedActivitiesShortList = assignedActivitiesFormatted.map( (activity, index) => {
      return (
        <li key={index}>
          {assignedActivitiesFormatted[index]}
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
