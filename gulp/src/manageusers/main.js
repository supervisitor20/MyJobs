/* global $ */

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, Link} from 'react-router';

import Overview from './overview';
import Roles from './roles';
import Role from './role';
import Activities from './activities';
import Users from './users';
import User from './user';
import NoMatch from './noMatch';

import AssociatedRolesList from './AssociatedRolesList';
import AssociatedUsersList from './AssociatedUsersList';
import AssociatedActivitiesList from './AssociatedActivitiesList';

import Status from './status';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rolesTableRows: [],
      activitiesTableRows: [],
      usersTableRows: [],
      callRolesAPI: this.callRolesAPI,
      callUsersAPI: this.callUsersAPI,
    };
    this.callActivitiesAPI = this.callActivitiesAPI.bind(this);
    this.callRolesAPI = this.callRolesAPI.bind(this);
    this.callUsersAPI = this.callUsersAPI.bind(this);
  }
  componentDidMount() {
    this.callActivitiesAPI();
    this.callRolesAPI();
    this.callUsersAPI();
  }
  componentWillReceiveProps(nextProps) {
    if ( nextProps.reloadAPIs === 'true' ) {
      this.callActivitiesAPI();
      this.callRolesAPI();
      this.callUsersAPI();
    }
  }
  callActivitiesAPI() {
    // Get activities once, and only once
    $.get('/manage-users/api/activities/', function getActivities(results) {
      const parsedResults = JSON.parse(results);

      const activitiesTableRows = [];
      for (let i = 0; i < parsedResults.length; i++) {
        if (parsedResults.hasOwnProperty(i)) {
          activitiesTableRows.push(
            <tr key={parsedResults[i].pk}>
              <td>{parsedResults[i].fields.name}</td>
              <td>{parsedResults[i].fields.description}</td>
            </tr>
          );
        }
      }
      this.setState({
        activitiesTableRows: activitiesTableRows,
      });
    }.bind(this));
  }
  callRolesAPI() {
    // Get roles once, but reload if needed
    $.get('/manage-users/api/roles/', function getRoles(results) {
      const rolesTableRows = [];
      for (const key in results) {
        if (results.hasOwnProperty(key)) {
          results[key].activities = JSON.parse(results[key].activities.assigned);
          results[key].users.assigned = JSON.parse(results[key].users.assigned);
          rolesTableRows.push(
            <tr key={results[key].role.id}>
              <td data-title="Role">{results[key].role.name}</td>
              <td data-title="Associated Activities">
                <AssociatedActivitiesList activities={results[key].activities}/>
              </td>
              <td data-title="Associated Users">
                <AssociatedUsersList users={results[key].users.assigned}/>
              </td>
              <td data-title="Edit">
               <Link to={`/role/${results[key].role.id}`} query={{ action: 'Edit' }} className="btn">Edit</Link>
              </td>
            </tr>
          );
        }
      }
      this.setState({
        rolesTableRows: rolesTableRows,
      });
    }.bind(this));
  }
  callUsersAPI() {
    // Get users once, but reload if needed
    $.get('/manage-users/api/users/', function getUsers(results) {
      const usersTableRows = [];
      for (const key in results) {
        if (results.hasOwnProperty(key)) {
          results[key].roles = JSON.parse(results[key].roles);
          usersTableRows.push(
            <tr key={key}>
              <td data-title="User Email">{results[key].email}</td>
              <td data-title="Associated Roles">
                <AssociatedRolesList roles={results[key].roles}/>
              </td>
              <td data-title="Status">
                <Status status={results[key].status}/>
              </td>
              <td data-title="Edit">
                <Link to={`/user/${key}`} action="Edit" query={{ action: 'Edit'}} className="btn">Edit</Link>
              </td>
            </tr>
          );
        }
      }
      this.setState({
        usersTableRows: usersTableRows,
      });
    }.bind(this));
  }
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <h1>DirectEmployers</h1>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <div className="breadcrumbs">
              <span>
                <Link to="/">Manage Users</Link>
              </span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-8 col-xs-12">
            <div className="card-wrapper">
              {this.props.children && React.cloneElement(
                this.props.children, {
                  activitiesTableRows: this.state.activitiesTableRows,
                  rolesTableRows: this.state.rolesTableRows,
                  usersTableRows: this.state.usersTableRows,
                  callRolesAPI: this.callRolesAPI,
                  callUsersAPI: this.callUsersAPI,
                })
              }
            </div>
          </div>

          <div className="col-sm-4 col-xs-12 pull-right">
            <div className="sidebar">
              <h2 className="top">Navigation</h2>
              <Link to="/" className="btn">Overview</Link>
              <Link to="roles" className="btn">Roles</Link>
              <Link to="activities" className="btn">Activities</Link>
              <Link to="users" className="btn">Users</Link>
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
      <Route path="*" component={NoMatch}/>
    </Route>
  </Router>
), document.getElementById('content'));
