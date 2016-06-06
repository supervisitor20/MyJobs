import 'babel/polyfill';
import {installPolyfills} from '../common/polyfills.js';
import {getCsrf} from '../common/cookie';
import React from 'react';
import _ from 'lodash-compat';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, Link} from 'react-router';

import Overview from './Overview';
import Roles from './Roles';
import Role from './Role';
import Activities from './Activities';
import Users from './Users';
import User from './User';
import HelpAndTutorials from './HelpAndTutorials';
import NoMatch from './NoMatch';
import AssociatedRolesList from './AssociatedRolesList';
import AssociatedUsersList from './AssociatedUsersList';
import AssociatedActivitiesList from './AssociatedActivitiesList';
import Status from './Status';
import {MyJobsApi} from 'common/myjobs-api';

installPolyfills();

const api = new MyJobsApi(getCsrf());

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rolesTableRows: [],
      rolesAPIResults: null,
      tablesOfActivitiesByApp: [],
      usersTableRows: [],
      currentUserID: null,
      callRolesAPI: this.callRolesAPI,
      callUsersAPI: this.callUsersAPI,
      callCurrentUserAPI: this.callCurrentUserAPI,
    };
    this.callActivitiesAPI = this.callActivitiesAPI.bind(this);
    this.callRolesAPI = this.callRolesAPI.bind(this);
    this.callUsersAPI = this.callUsersAPI.bind(this);
    this.callCurrentUserAPI = this.callCurrentUserAPI.bind(this);
  }
  componentDidMount() {
    this.callActivitiesAPI();
    this.callRolesAPI();
    this.callUsersAPI();
    this.callCurrentUserAPI();
  }
  componentWillReceiveProps(nextProps) {
    if ( nextProps.reloadAPIs === 'true' ) {
      this.callActivitiesAPI();
      this.callRolesAPI();
      this.callUsersAPI();
      this.callCurrentUserAPI();
    }
  }
  async callActivitiesAPI() {
    // Get activities once, and only once
    const results = await api.get('/manage-users/api/activities/');
    // Create an array of tables, each a list of activities of a
    // particular app_access
    const activitiesGroupedByAppAccess = _.groupBy(results, 'app_access_name');
    // Build a table for each app present
    const tablesOfActivitiesByApp = [];
    // First assemble rows needed for each table
    _.forOwn(activitiesGroupedByAppAccess, function buildListOfTables(activityGroup, key) {
      // For each app, build list of rows from results
      const activityRows = [];
      // Loop through all activities...
      _.forOwn(activityGroup, function buildListOfRows(activity) {
        activityRows.push(
          <tr key={activity.activity_id}>
            <td>{activity.activity_name}</td>
            <td>{activity.activity_description}</td>
          </tr>
        );
      });
      // Assemble this app's table
      tablesOfActivitiesByApp.push(
        <span key={key}>
          <h3>{key}</h3>
          <table className="table table-striped table-activities">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {activityRows}
            </tbody>
          </table>
        </span>
      );
    });
    this.setState({
      tablesOfActivitiesByApp: tablesOfActivitiesByApp,
    });
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
    _.forOwn(results, function buildListOfRows(user, key) {
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
    });
    this.setState({
      usersTableRows: usersTableRows,
    });
  }
  async callCurrentUserAPI() {
    // Get current logged in user information
    const results = await api.get('/manage-users/api/current-user/');
    this.setState({
      currentUserID: results.id,
    });
  }
  render() {
    return (
      <div>
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
                  tablesOfActivitiesByApp: this.state.tablesOfActivitiesByApp,
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

App.propTypes = {
  children: React.PropTypes.object.isRequired,
};

render((
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Overview} />
      <Route path="activities" component={Activities} />
      <Route path="roles" component={Roles} />
      <Route path="/role/add" component={Role} />
      <Route path="/role/:roleId" component={Role} />
      <Route path="users" component={Users} />
      <Route path="/user/add" component={User} />
      <Route path="/user/:userId" component={User} />
      <Route path="help-and-tutorials" component={HelpAndTutorials} />
      <Route path="*" component={NoMatch}/>
    </Route>
  </Router>
), document.getElementById('content'));
