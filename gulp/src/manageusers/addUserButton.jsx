import React from 'react';
import {Link} from 'react-router';

const AddUserButton = React.createClass({
  render() {
    return (
      <Link to="user/add" query={{ action: 'Add' }} className="primary pull-right btn btn-default">Add User</Link>
    );
  },
});

export default AddUserButton;
