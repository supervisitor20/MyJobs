import React from 'react';
import {Col, Row, Table} from 'react-bootstrap';

import ActivitiesList from './ActivitiesList';
import {connect} from 'react-redux';
import _ from 'lodash-compat';

class Activities extends React.Component {
  render() {
    // Create an array of tables, each a list of activities of a
    // particular app_access
    const activitiesGroupedByAppAccess =
      _.groupBy(this.props.activitiesList, 'app_access_name');
    // Build a table for each app present
    const tablesOfActivitiesByApp = [];
    // First assemble rows needed for each table
    _.forOwn(activitiesGroupedByAppAccess, (activityGroup, key) => {
      // For each app, build list of rows from results
      const activityRows = [];
      // Loop through all activities...
      _.forOwn(activityGroup, activity => {
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
          <Table className="table-activities" striped>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {activityRows}
            </tbody>
          </Table>
        </span>
      );
    });

    return (
      <Row>
        <Col xs={12}>
          <div className="wrapper-header">
            <h2>Activities</h2>
          </div>
          <div className="product-card-full no-highlight">
            <ActivitiesList
              tablesOfActivitiesByApp={tablesOfActivitiesByApp} />
          </div>
        </Col>
      </Row>
    );
  }
}

Activities.propTypes = {
  activitiesList: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      activity_description: React.PropTypes.string.isRequired,
      activity_id: React.PropTypes.number.isRequired,
      activity_name: React.PropTypes.string.isRequired,
      app_access_id: React.PropTypes.number.isRequired,
      app_access_name: React.PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
};

export default connect(s => ({
  activitiesList: s.activities.data,
}))(Activities);
