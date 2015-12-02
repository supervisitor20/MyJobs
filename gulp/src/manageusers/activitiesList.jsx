import React from 'react';

class ActivitiesList extends React.Component {
  render() {
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {this.props.activitiesTableRows}
          </tbody>
        </table>
      </div>
    );
  }
}

ActivitiesList.propTypes = {
  activitiesTableRows: React.PropTypes.array.isRequired,
};

export default ActivitiesList;
