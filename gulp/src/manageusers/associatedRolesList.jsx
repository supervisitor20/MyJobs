import React from 'react';

class AssociatedRolesList extends React.Component {
  render() {
    const associatedRolesList = this.props.roles.map( (role, index) => {
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
  }
}

AssociatedRolesList.propTypes = {
  roles: React.PropTypes.array.isRequired,
};

export default AssociatedRolesList;
