import React from 'react';
import {Link} from 'react-router';

class AddUserButton extends React.Component {
  render() {
    return (
      <Link to="user/add" query={{action: 'Add'}} className="primary pull-right btn btn-default">Add User</Link>
    );
  }
}

export default AddUserButton;
