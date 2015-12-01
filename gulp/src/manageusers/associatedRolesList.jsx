import React from 'react';

const AssociatedRolesList = React.createClass({
  propTypes: {
    roles: React.PropTypes.array.isRequired,
  },
  render() {
    const associatedRolesList = this.props.roles.map(function createAssociatedRolesList(role, index) {
      return (
        <li key={index}>
          {role.fields.name}
        </li>
      );
    });
    return (
      <ul>
        {associatedRolesList}
      </ul>
    );
  },
});

export default AssociatedRolesList;
