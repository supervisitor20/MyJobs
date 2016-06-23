import React from 'react';
import ActivitiesList from './ActivitiesList';
import {connect} from 'react-redux';
import _ from 'lodash-compat';

class Activities extends React.Component {
  render() {
    // Create an array of tables, each a list of activities of a
    // particular app_access
    const activitiesGroupedByAppAccess = _.groupBy(this.props.activitiesList, 'app_access_name');
    // Build a table for each app present
    const tablesOfActivitiesByApp = [];
    // First assemble rows needed for each table
    _.forOwn(activitiesGroupedByAppAccess, function buildListOfTables(activityGroup, key) {
      // For each app, build list of rows from results
      const activityRows = [];
      // Loop through all activities...
      _.forOwn(activityGroup, function buildListOfRows(activity) {
        activityRows.push(
          <tr key={activity.activity_id}>
            <td>{activity.activity_name}</td>
            <td>{activity.activity_description}</td>
          </tr>
        );
      });
      // Assemble this app's table
      tablesOfActivitiesByApp.push(
        <span key={key}>
          <h3>{key}</h3>
          <table className="table table-striped table-activities">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {activityRows}
            </tbody>
          </table>
        </span>
      );
    });

    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Activities</h2>
          </div>
          <div className="product-card-full no-highlight">
            <ActivitiesList tablesOfActivitiesByApp={tablesOfActivitiesByApp} />
          </div>
        </div>
      </div>
    );
  }
}

Activities.propTypes = {
  activitiesList: React.PropTypes.array.isRequired,
};

export default connect(s => ({
  activitiesList: s.activities.data,
}))(Activities);
