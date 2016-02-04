import React from 'react';
import _ from 'lodash-compat';

import {formatActivityName} from './formatActivityName';

class AssociatedActivitiesList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const assignedActivitiesFormatted = [];
    // The API gives activities grouped by app_access
    // Assemble simple list of all assigned_activities, no matter the app_access
    const activitiesGroupedByAppAccess = this.props.activities;
    _.forOwn(activitiesGroupedByAppAccess, function loopThroughGroupedActivities(activityGroup) {
      const assignedActivities = activityGroup.assigned_activities;
      _.forOwn(assignedActivities, function loopThroughAssignedActivities(activity) {
        const formattedActivityName = formatActivityName(activity.name);
        assignedActivitiesFormatted.push(formattedActivityName);
      });
    });

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
