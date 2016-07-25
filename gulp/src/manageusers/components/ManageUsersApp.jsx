import React from 'react';
import {MyJobsApi} from 'common/myjobs-api';
import {getCsrf} from 'common/cookie';
import _ from 'lodash-compat';
import {Link} from 'react-router';
import AssociatedRolesList from './AssociatedRolesList';
import AssociatedUsersList from './AssociatedUsersList';
import AssociatedActivitiesList from './AssociatedActivitiesList';
import Status from './Status';
import Confirm from 'common/ui/Confirm';

const api = new MyJobsApi(getCsrf());

export default class ManageUsersApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rolesTableRows: [],
      currentUserID: null,
      rolesAPIResults: null,
      usersTableRows: [],
      callRolesAPI: this.callRolesAPI,
      callUsersAPI: this.callUsersAPI,
      confirmShow: false,
    };
    this.callRolesAPI = this.callRolesAPI.bind(this);
    this.callUsersAPI = this.callUsersAPI.bind(this);
  }
  componentDidMount() {
    this.callRolesAPI();
    this.callUsersAPI();
  }
  componentWillReceiveProps(nextProps) {
    if ( nextProps.reloadAPIs === 'true' ) {
      this.callRolesAPI();
      this.callUsersAPI();
    }
  }
  async callRolesAPI() {
    // Get roles once, but reload if needed
    const results = await api.get('/manage-users/api/roles/');
    const rolesTableRows = [];

    _.forOwn(results, function buildListOfRows(role) {
      let editRoleLink;
      if (role.role_name !== 'Admin') {
        editRoleLink = <Link to={`/role/${role.role_id}`} query={{action: 'Edit'}} className="btn">Edit</Link>;
      }
      rolesTableRows.push(
        <tr key={role.role_id}>
          <td data-title="Role">{role.role_name}</td>
          <td data-title="Associated Activities">
            <AssociatedActivitiesList activities={role.activities}/>
          </td>
          <td data-title="Associated Users">
            <AssociatedUsersList users={role.assigned_users}/>
          </td>
          <td data-title="Edit">
            {editRoleLink}
          </td>
        </tr>
      );
    });
    this.setState({
      rolesTableRows: rolesTableRows,
      rolesAPIResults: results,
    });
  }
  async callUsersAPI() {
    // Get users once, but reload if needed
    const results = await api.get('/manage-users/api/users/');
    const usersTableRows = [];
    _.forOwn(results, (user, key) => {
      // Identify userID of the logged in user
      if (typeof user === 'number' ) {
        this.setState({
          currentUserID: user,
        });
      } else {
        user.roles = JSON.parse(user.roles);
        usersTableRows.push(
          <tr key={key}>
            <td data-title="User Email">{user.email}</td>
            <td data-title="Associated Roles">
              <AssociatedRolesList roles={user.roles}/>
            </td>
            <td data-title="Status">
              <Status status={user.status} lastInvitation={user.lastInvitation}/>
            </td>
            <td data-title="Edit">
              <Link to={`/user/${key}`} action="Edit" query={{action: 'Edit'}} className="btn">Edit</Link>
            </td>
          </tr>
        );
      }
    });
    this.setState({
      usersTableRows: usersTableRows,
    });
  }
  render() {
    return (
      <div>
        <Confirm/>
        <div className="row">
          <div className="col-sm-12">
            <div className="breadcrumbs">
              <span>
                Manage Users
              </span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-4 col-xs-12 pull-right">
            <div className="sidebar">
              <h2 className="top">Navigation</h2>
              <Link to="/" className="btn">Overview</Link>
              <Link to="users" className="btn">Users</Link>
              <Link to="roles" className="btn">Roles</Link>
              <Link to="activities" className="btn">Activities</Link>
              <Link to="help-and-tutorials" className="btn">Help & Tutorials</Link>
            </div>
          </div>

          <div className="col-sm-8 col-xs-12">
            <div className="card-wrapper">
              {this.props.children && React.cloneElement(
                this.props.children, {
                  rolesTableRows: this.state.rolesTableRows,
                  usersTableRows: this.state.usersTableRows,
                  currentUserID: this.state.currentUserID,
                  callRolesAPI: this.callRolesAPI,
                  callUsersAPI: this.callUsersAPI,
                  api: api,
                  rolesAPIResults: this.state.rolesAPIResults,
                })
              }
            </div>
          </div>
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
}

ManageUsersApp.propTypes = {
  children: React.PropTypes.object.isRequired,
};
