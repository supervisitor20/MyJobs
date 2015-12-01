import React from 'react';

const RolesList = React.createClass({
  propTypes: {
    rolesTableRows: React.PropTypes.array.isRequired,
  },
  render() {
    return (
      <div>
        <table className="table" id="no-more-tables">
          <thead>
            <tr>
              <th>Role</th>
              <th>Associated Activities</th>
              <th>Associated Users</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.props.rolesTableRows}
          </tbody>
        </table>
      </div>
    );
  },
});

export default RolesList;
