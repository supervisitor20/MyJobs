import React from 'react';
import UsersList from './usersList.jsx';
import AddUserButton from './addUserButton.jsx';

class Users extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Users</h2>
          </div>
          <div className="product-card-full no-highlight">

            <UsersList usersTableRows={this.props.usersTableRows} />

            <hr/>

            <div className="row">
              <div className="col-xs-12">
                <AddUserButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Users.propTypes = {
  usersTableRows: React.PropTypes.array.isRequired,
}

Users.defaultProps = {
  usersTableRows: [],
}

export default Users;
