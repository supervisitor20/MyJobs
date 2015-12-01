/* global $ */

import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, Link} from 'react-router';

import Overview from './overview.jsx';
import Roles from './roles.jsx';
import Role from './role.jsx';
import Activities from './activities.jsx';
import Users from './users.jsx';
import User from './user.jsx';
import NoMatch from './noMatch.jsx';

import AssociatedRolesList from './AssociatedRolesList.jsx';
import AssociatedUsersList from './AssociatedUsersList.jsx';
import AssociatedActivitiesList from './AssociatedActivitiesList.jsx';

import Status from './status.jsx';

const App = React.createClass({
  propTypes: {
    children: React.PropTypes.object.isRequired,
  },
  getInitialState() {
    return {
      rolesTableRows: [],
      activitiesTableRows: [],
      usersTableRows: [],
      callRolesAPI: this.callRolesAPI,
      callUsersAPI: this.callUsersAPI,
    };
  },
  componentDidMount() {
    this.callActivitiesAPI();
    this.callRolesAPI();
    this.callUsersAPI();
  },
  componentWillReceiveProps(nextProps) {
    if ( nextProps.reloadAPIs === 'true' ) {
      this.callActivitiesAPI();
      this.callRolesAPI();
      this.callUsersAPI();
    }
  },
  callActivitiesAPI() {
    // Get activities once, and only once
    $.get('/manage-users/api/activities/', function(results) {
      results = JSON.parse(results);
      if (this.isMounted()) {
        const activitiesTableRows = [];
        for (let i = 0; i < results.length; i++) {
          activitiesTableRows.push(
            <tr key={results[i].pk}>
              <td>{results[i].fields.name}</td>
              <td>{results[i].fields.description}</td>
            </tr>
          );
        }
        this.setState({
          activitiesTableRows: activitiesTableRows,
        });
      }
    }.bind(this));
  },
  callRolesAPI() {
    // Get roles once, but reload if needed
    $.get('/manage-users/api/roles/', function(results) {
      if (this.isMounted()) {
        const rolesTableRows = [];
        for (const key in results) {
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
        this.setState({
          rolesTableRows: rolesTableRows,
        });
      }
    }.bind(this));
  },
  callUsersAPI() {
    // Get users once, but reload if needed
    $.get('/manage-users/api/users/', function(results) {
      if (this.isMounted()) {
        const usersTableRows = [];
        for (const key in results) {
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
        this.setState({
          usersTableRows: usersTableRows,
        });
      }
    }.bind(this));
  },
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
  },
});

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
