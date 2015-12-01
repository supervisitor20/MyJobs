import React from 'react';

const UsersList = React.createClass({
  propTypes: {
    usersTableRows: React.PropTypes.array.isRequired,
  },
  render() {
    return (
      <div>
        <table className="table" id="no-more-tables">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Associated Roles</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.props.usersTableRows}
          </tbody>
        </table>
      </div>
    );
  },
});

export default UsersList;
