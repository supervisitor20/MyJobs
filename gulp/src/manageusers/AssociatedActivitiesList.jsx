import React from 'react';

import {formatActivityName} from 'util/formatActivityName';

class AssociatedActivitiesList extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const associatedActivitiesShortList = this.props.activities.map( (activity, index) => {
      return (
        <li key={index}>
          {formatActivityName(activity.fields.name)}
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
