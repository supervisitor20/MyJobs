import React from 'react';
import RolesList from './rolesList.jsx';
import {Link} from 'react-router';

const Roles = React.createClass({
  propTypes: {
    rolesTableRows: React.PropTypes.array.isRequired,
  },
  getDefaultProps: function() {
    return {
      rolesTableRows: [],
    };
  },
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Roles</h2>
          </div>
          <div className="product-card-full no-highlight">

            <RolesList rolesTableRows={this.props.rolesTableRows} />

            <hr/>

            <div className="row">
              <div className="col-xs-12">
                <Link to="role/add" query={{ action: 'Add' }} className="primary pull-right btn btn-default">Add Role</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});

export default Roles;
