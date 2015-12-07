import React from 'react';

class UsersList extends React.Component {
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
  }
}

UsersList.propTypes = {
  usersTableRows: React.PropTypes.array.isRequired,
};

export default UsersList;
