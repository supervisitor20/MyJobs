import React from 'react';

const ActivitiesList = React.createClass({
  propTypes: {
    activitiesTableRows: React.PropTypes.array.isRequired,
  },
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
  },
});

export default ActivitiesList;
