import React from 'react';

const AssociatedUsersList = React.createClass({
  propTypes: {
    users: React.PropTypes.array.isRequired,
  },
  render() {
    const associatedUsersList = this.props.users.map(function(user, index) {
      return (
        <li key={index}>
          {user.fields.email}
        </li>
      );
    });
    return (
      <ul>
        {associatedUsersList}
      </ul>
    );
  },
});

export default AssociatedUsersList;
