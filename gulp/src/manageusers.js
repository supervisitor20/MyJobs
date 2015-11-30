/*global $ */

import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Link } from 'react-router';
import {getCsrf} from 'util/cookie';
import {validateEmail} from 'util/validateEmail';
import Button from 'react-bootstrap/lib/Button';
import FilteredMultiSelect from 'react-filtered-multiselect';


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
    {/* Get activities once, and only once */}
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
    {/* Get roles once, but reload if needed */}
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
    {/* Get users once, but reload if needed */}
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


const NoMatch = React.createClass({
  render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="wrapper-header">
            <h2>Not found.</h2>
          </div>
          <div className="product-card no-highlight">
            <p>Not found.</p>
          </div>
        </div>
      </div>
    );
  },
});


const HelpText = React.createClass({
  propTypes: {
    message: React.PropTypes.string.isRequired,
  },
  render() {
    return (
      <div className="input-error">
        {this.props.message}
      </div>
    );
  },
});

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


const Role = React.createClass({
  propTypes: {
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    callRolesAPI: React.PropTypes.func,
    history: React.PropTypes.object.isRequired,
  },
  getInitialState() {
    return {
      apiResponseHelp: '',
      activitiesMultiselectHelp: '',
      roleName: '',
      roleNameHelp: '',
      availableActivities: [],
      assignedActivities: [],
      availableUsers: [],
      assignedUsers: [],
    };
  },
  componentDidMount() {
    const action = this.props.location.query.action;

    if (action === 'Edit') {
      $.get('/manage-users/api/roles/' + this.props.params.roleId, function(results) {
        if (this.isMounted()) {

          const roleObject = results[this.props.params.roleId];

          const roleName = roleObject.role.name;

          const availableUsersUnformatted = JSON.parse(roleObject.users.available);
          const availableUsers = availableUsersUnformatted.map(function(obj) {
            const user = {};
            user.id = obj.pk;
            user.name = obj.fields.email;
            return user;
          });

          const assignedUsersUnformatted = JSON.parse(roleObject.users.assigned);
          const assignedUsers = assignedUsersUnformatted.map(function(obj) {
            const user = {};
            user.id = obj.pk;
            user.name = obj.fields.email;
            return user;
          });

          const availableActivitiesUnformatted = JSON.parse(roleObject.activities.available);
          const availableActivities = availableActivitiesUnformatted.map(function(obj) {
            const activity = {};
            activity.id = obj.pk;
            activity.name = obj.fields.name;
            return activity;
          });

          const assignedActivitiesUnformatted = JSON.parse(roleObject.activities.assigned);
          const assignedActivities = assignedActivitiesUnformatted.map(function(obj) {
            const activity = {};
            activity.id = obj.pk;
            activity.name = obj.fields.name;
            return activity;
          });

          this.setState({
            apiResponseHelp: '',
            roleName: roleName,
            availableActivities: availableActivities,
            assignedActivities: assignedActivities,
            availableUsers: availableUsers,
            assignedUsers: assignedUsers,
          });
        }
      }.bind(this));
    }
    else {
      $.get('/manage-users/api/roles/', function(results) {
        if (this.isMounted()) {

          {/* Objects in results don't have predictable keys */}
          {/* It doesn't matter which one we get */}
          {/* Therefore get the first one with a loop */}
          let roleObject = {};
          for (const key in results) {
            roleObject = results[key];
            break;
          }

          const availableUsersUnformatted = JSON.parse(roleObject.users.available);
          const availableUsers = availableUsersUnformatted.map(function(obj) {
            const user = {};
            user.id = obj.pk;
            user.name = obj.fields.email;
            return user;
          });

          const availableActivitiesUnformatted = JSON.parse(roleObject.activities.available);
          const availableActivities = availableActivitiesUnformatted.map(function(obj) {
            const activity = {};
            activity.id = obj.pk;
            activity.name = obj.fields.name;
            return activity;
          });
          this.setState({
            apiResponseHelp: '',
            availableActivities: availableActivities,
            availableUsers: availableUsers,
          });
        }
      }.bind(this));
    }

  },
  onTextChange(event) {
    this.state.roleName = event.target.value;

    {/* This works, but is cumbersome to scale. For next app, or if we grow this one larger, refactor using Flux.
      setState overrides some states because they are n-levels deep.
      Look into immutability: http://facebook.github.io/react/docs/update.html }

    this.setState({
      apiResponseHelp: '',
      roleName: this.state.roleName,
      availableActivities: this.refs.activities.state.availableActivities,
      assignedActivities: this.refs.activities.state.assignedActivities,
      availableUsers: this.refs.users.state.availableUsers,
      assignedUsers: this.refs.users.state.assignedUsers,
    });

  },
  handleSaveRoleClick() {
    {/* Grab form fields and validate */}

    {/* TODO: Warn user? If they remove a user from all roles, they will have to reinvite him. */}

    const roleId = this.props.params.roleId;

    let assignedUsers = this.refs.users.state.assignedUsers;

    const roleName = this.state.roleName;
    if (roleName === '') {
      this.setState({
        apiResponseHelp: '',
        roleNameHelp: 'Role name empty.',
        roleName: this.state.roleName,
        availableActivities: this.refs.activities.state.availableActivities,
        assignedActivities: this.refs.activities.state.assignedActivities,
        availableUsers: this.refs.users.state.availableUsers,
        assignedUsers: this.refs.users.state.assignedUsers,
      });
      return;
    }

    let assignedActivities = this.refs.activities.state.assignedActivities;

    if (assignedActivities.length < 1) {
      this.setState({
        apiResponseHelp: '',
        activitiesMultiselectHelp: 'Each role must have at least one activity.',
        roleName: this.state.roleName,
        availableActivities: this.refs.activities.state.availableActivities,
        assignedActivities: this.refs.activities.state.assignedActivities,
        availableUsers: this.refs.users.state.availableUsers,
        assignedUsers: this.refs.users.state.assignedUsers,
      });
      return;
    }

    {/* No errors? Clear help text */}

    this.setState({
      apiResponseHelp: '',
      activitiesMultiselectHelp: '',
      roleName: this.state.roleName,
      availableActivities: this.refs.activities.state.availableActivities,
      assignedActivities: this.refs.activities.state.assignedActivities,
      availableUsers: this.refs.users.state.availableUsers,
      assignedUsers: this.refs.users.state.assignedUsers,
    });

    {/* Format properly */}

    assignedActivities = assignedActivities.map(function(obj) {
      return obj.name;
    });

    assignedUsers = assignedUsers.map(function(obj) {
      return obj.name;
    });

    {/* Determine URL based on action */}
    const action = this.props.location.query.action;

    let url = '';
    if ( action === 'Edit' ) {
      url = '/manage-users/api/roles/edit/' + roleId + '/';
    }
    else {
      url = '/manage-users/api/roles/create/';
    }

    {/* Build data to send */}
    const dataToSend = {};
    dataToSend.csrfmiddlewaretoken = getCsrf();
    dataToSend.roleName = roleName;
    dataToSend.assignedActivities = assignedActivities;
    dataToSend.assignedUsers = assignedUsers;

    {/* Submit to server */}
    $.post(url, dataToSend, function(response) {
      const history = this.props.history;

      {/* TODO: Render a nice disappearing alert with the disappear_text prop. Use the React CSSTransitionGroup addon.
        http://stackoverflow.com/questions/33778675/react-make-flash-message-disappear-automatically
        }
      if ( response.success === 'true' ) {
        {/* Reload API */}
        this.props.callRolesAPI();
        {/* Redirect user */}
        history.pushState(null, '/roles');
      }
      else if ( response.success === 'false' ) {
        this.setState({
          apiResponseHelp: response.message,
          roleName: this.state.roleName,
          availableActivities: this.refs.activities.state.availableActivities,
          assignedActivities: this.refs.activities.state.assignedActivities,
          availableUsers: this.refs.users.state.availableUsers,
          assignedUsers: this.refs.users.state.assignedUsers,
        });
      }
    }.bind(this))
    .fail( function(xhr) {
      if (xhr.status === 403) {
        this.setState({
          apiResponseHelp: 'Unable to save role. Insufficient privileges.',
        });
      }
    }.bind(this));
  },
  handleDeleteRoleClick() {
    const history = this.props.history;
    {/* Temporary until I replace $.ajax jQuery with vanilla JS ES6 arrow function */}
    const self = this;

    if (confirm('Are you sure you want to delete this role?')) {
    } else {
      return;
    }

    const roleId = this.props.params.roleId;

    const csrf = getCsrf();

    {/* Submit to server */}

    $.ajax( '/manage-users/api/roles/delete/' + roleId + '/',
      {
        type: 'DELETE',
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-CSRFToken', csrf);
        },
        success: function() {
       {/* Reload API */}
       self.props.callRolesAPI();
       {/* Redirect the user */}
       history.pushState(null, '/roles');

     }})
    .fail( function(xhr) {
      if (xhr.status === 403) {
        this.setState({
          apiResponseHelp: 'Role not deleted. Insufficient privileges.',
        });
      }
    }.bind(this));
  },
  render() {
    let action = this.props.location.query.action;

    let deleteRoleButton = '';
    if (action === 'Edit') {
      deleteRoleButton = <Button className="pull-right" onClick={this.handleDeleteRoleClick}>Delete Role</Button>;
    }
    else {
      action = 'Add';
    }

    const roleNameHelp = this.state.roleNameHelp;

    const apiResponseHelp = this.state.apiResponseHelp;

    const activitiesMultiselectHelp = this.state.activitiesMultiselectHelp;

    return (
      <div>
        <div className="row">
          <div className="col-xs-12 ">
            <div className="wrapper-header">
              <h2>{action} Role</h2>
            </div>
            <div className="product-card-full no-highlight">
              <div className="row">
                <div className="col-xs-12">
                  <HelpText message={roleNameHelp} />
                  <label htmlFor="id_role_name">Role Name*:</label>
                  <input id="id_role_name" maxLength="255" name="name" type="text" value={this.state.roleName} size="35" onChange={this.onTextChange}/>
                </div>
              </div>

              <hr/>

              <HelpText message={activitiesMultiselectHelp} />

              <ActivitiesMultiselect availableActivities={this.state.availableActivities} assignedActivities={this.state.assignedActivities} ref="activities"/>

              <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>

              <hr/>

              <UsersMultiselect availableUsers={this.state.availableUsers} assignedUsers={this.state.assignedUsers} ref="users"/>

              <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>

              <hr />

              <div className="row">
                <div className="col-xs-12">
                  <span className="primary pull-right">
                    <HelpText message={apiResponseHelp} />
                  </span>
                </div>

                <div className="col-xs-12">
                  <Button className="primary pull-right" onClick={this.handleSaveRoleClick}>Save Role</Button>
                  {deleteRoleButton}
                  <Link to="roles" className="pull-right btn btn-default">Cancel</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});


const Overview = React.createClass({
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Overview</h2>
          </div>
          <div className="product-card no-highlight">
            <p>Use this tool to create users and permit them to perform letious activities.</p>
            <p>First, create a role. A role is a group of activities (e.g. view existing communication records, add new communication records, etc.). Then, create a user and assign them to that role. Once assigned to a role, that user can execute activities assigned to that role.</p>
          </div>
        </div>
      </div>
    );
  },
});


const Status = React.createClass({
  render() {
    let button = '';
    if (this.props.status === true) {
      button = <span className="label label-success">Active</span>;
    }
    else if (this.props.status === false) {
      button = <span className="label label-warning">Pending</span>;
    }
    return (
      <span>
        {button}
      </span>
    );
  },
});


const AssociatedRolesList = React.createClass({
  propTypes: {
    roles: React.PropTypes.array.isRequired,
  },
  render() {
    const associatedRolesList = this.props.roles.map(function(role, index) {
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


const RolesList = React.createClass({
  propTypes: {
    rolesTableRows: React.PropTypes.array.isRequired,
  },
  render() {
    return (
      <div>
        <table className="table" id="no-more-tables">
          <thead>
            <tr>
              <th>Role</th>
              <th>Associated Activities</th>
              <th>Associated Users</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.props.rolesTableRows}
          </tbody>
        </table>
      </div>
    );
  },
});


const ActivitiesList = React.createClass({
  propTypes: {
    activitiesTableRows: React.PropTypes.array.isRequired,
  },
  render() {
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {this.props.activitiesTableRows}
          </tbody>
        </table>
      </div>
    );
  },
});


const Activities = React.createClass({
  propTypes: {
    activitiesTableRows: React.PropTypes.array.isRequired,
  },
  getDefaultProps: function() {
    return {
      activitiesTableRows: [],
    };
  },
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Activities</h2>
          </div>
          <div className="product-card-full no-highlight">
            <ActivitiesList activitiesTableRows={this.props.activitiesTableRows} />
          </div>
        </div>
      </div>
    );
  },
});


const AssociatedActivitiesList = React.createClass({
  propTypes: {
    activities: React.PropTypes.array.isRequired,
  },
  render() {
    const associated_activities_list = this.props.activities.map(function(activity, index) {
      return (
        <li key={index}>
          {activity.fields.name}
        </li>
      );
    });
    return (
      <ul>
        {associated_activities_list}
      </ul>
    );
  },
});


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


const bootstrapClasses = {
  filter: 'form-control',
  select: 'form-control',
  button: 'btn btn btn-block btn-default',
  buttonActive: 'btn btn btn-block btn-primary',
};


const ActivitiesMultiselect = React.createClass({
  propTypes: {
    availableActivities: React.PropTypes.array.isRequired,
    assignedActivities: React.PropTypes.array.isRequired,
  },
  getInitialState() {
    return {
      availableActivities: this.props.availableActivities,
      assignedActivities: this.props.assignedActivities,
    };
  },
  componentWillReceiveProps(nextProps) {
    this.setState({
      availableActivities: nextProps.availableActivities,
      assignedActivities: nextProps.assignedActivities,
    });
  },
  _onSelect(assignedActivities) {
    assignedActivities.sort((a, b) => a.id - b.id);
    this.setState({assignedActivities});
  },
  _onDeselect(deselectedOptions) {
    const assignedActivities = this.state.assignedActivities.slice();
    deselectedOptions.forEach(option => {
      assignedActivities.splice(assignedActivities.indexOf(option), 1);
    });
    this.setState({assignedActivities});
  },
  render() {
    const {assignedActivities, availableActivities} = this.state;

    return (
        <div className="row">

          <div className="col-xs-6">
            <label>Activities Available:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={availableActivities}
              selectedOptions={assignedActivities}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Activities Assigned:</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control',
                select: 'form-control',
                button: 'btn btn btn-block btn-default',
                buttonActive: 'btn btn btn-block btn-danger',
              }}
              onChange={this._onDeselect}
              options={assignedActivities}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  },
});


const UsersMultiselect = React.createClass({
  propTypes: {
    availableActivities: React.PropTypes.array.isRequired,
    assignedActivities: React.PropTypes.array.isRequired,
  },
  getInitialState() {
    return {
      assignedUsers: this.props.assignedUsers,
      availableUsers: this.props.availableUsers,
    };
  },
  componentWillReceiveProps(nextProps) {
    this.setState({
      availableUsers: nextProps.availableUsers,
      assignedUsers: nextProps.assignedUsers,
    });
  },
  _onSelect(assignedUsers) {
    assignedUsers.sort((a, b) => a.id - b.id);
    this.setState({assignedUsers});
  },
  _onDeselect(deselectedOptions) {
    const assignedUsers = this.state.assignedUsers.slice();
    deselectedOptions.forEach(option => {
      assignedUsers.splice(assignedUsers.indexOf(option), 1);
    });
    this.setState({assignedUsers});
  },
  render() {
    const {assignedUsers, availableUsers} = this.state;

    return (
        <div className="row">
          <div className="col-xs-6">
            <label>Users Available:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={availableUsers}
              selectedOptions={assignedUsers}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Users Assigned:</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control',
                select: 'form-control',
                button: 'btn btn btn-block btn-default',
                buttonActive: 'btn btn btn-block btn-danger',
              }}
              onChange={this._onDeselect}
              options={assignedUsers}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  },
});


const UsersList = React.createClass({
  propTypes: {
    usersTableRows: React.PropTypes.array.isRequired,
  },
  render() {
    return (
      <div>
        <table className="table" id="no-more-tables">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Associated Roles</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.props.usersTableRows}
          </tbody>
        </table>
      </div>
    );
  },
});

const AddUserButton = React.createClass({
  render() {
    return (
      <Link to="user/add" query={{ action: 'Add' }} className="primary pull-right btn btn-default">Add User</Link>
    );
  },
});

const Users = React.createClass({
  propTypes: {
    usersTableRows: React.PropTypes.array.isRequired,
  },
  getDefaultProps: function() {
    return {
      usersTableRows: [],
    };
  },
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Users</h2>
          </div>
          <div className="product-card-full no-highlight">

            <UsersList usersTableRows={this.props.usersTableRows} />

            <hr/>

            <div className="row">
              <div className="col-xs-12">
                <AddUserButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});


const RolesMultiselect = React.createClass({
  propTypes: {
    assignedRoles: React.PropTypes.object.isRequired,
    availableRoles: React.PropTypes.object.isRequired,
  },
  getInitialState() {
    return {
      assignedRoles: this.props.assignedRoles,
      availableRoles: this.props.availableRoles,
    };
  },
  componentWillReceiveProps(nextProps) {
    this.setState({
      availableRoles: nextProps.availableRoles,
      assignedRoles: nextProps.assignedRoles,
    });
  },
  _onSelect(assignedRoles) {
    assignedRoles.sort((a, b) => a.id - b.id);
    this.setState({assignedRoles});
  },
  _onDeselect(deselectedOptions) {
    const assignedRoles = this.state.assignedRoles.slice();
    deselectedOptions.forEach(option => {
      assignedRoles.splice(assignedRoles.indexOf(option), 1);
    });
    this.setState({assignedRoles});
  },
  render() {
    const {assignedRoles, availableRoles} = this.state;

    return (
        <div className="row">
          <div className="col-xs-6">
            <label>Roles Available:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={availableRoles}
              selectedOptions={assignedRoles}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Roles Assigned:</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control',
                select: 'form-control',
                button: 'btn btn btn-block btn-default',
                buttonActive: 'btn btn btn-block btn-danger',
              }}
              onChange={this._onDeselect}
              options={assignedRoles}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  },
});


const User = React.createClass({
  propTypes: {
    location: React.PropTypes.object.isRequired,
    params: React.PropTypes.object.isRequired,
    callUsersAPI: React.PropTypes.func,
    history: React.PropTypes.object.isRequired,
  },
  getInitialState() {
    {/* TODO Refactor to use basic Actions and the Dispatchers */}
    return {
      apiResponseHelp: '',
      userEmail: '',
      userEmailHelp: '',
      roleMultiselectHelp: '',
      availableRoles: [],
      assignedRoles: [],
      api_response_message: '',
    };
  },
  componentDidMount() {
    const action = this.props.location.query.action;

    if (action === 'Edit') {
      $.get('/manage-users/api/users/' + this.props.params.userId, function(results) {
        if (this.isMounted()) {
          const userObject = results[this.props.params.userId];

          const userEmail = userObject.email;

          const availableRolesUnformatted = JSON.parse(userObject.roles.available);
          const availableRoles = availableRolesUnformatted.map(function(obj) {
            const role = {};
            role.id = obj.pk;
            role.name = obj.fields.name;
            return role;
          });

          const assignedRolesUnformatted = JSON.parse(userObject.roles.assigned);
          const assignedRoles = assignedRolesUnformatted.map(function(obj) {
            const role = {};
            role.id = obj.pk;
            role.name = obj.fields.name;
            return role;
          });

          this.setState({
            userEmail: userEmail,
            userEmailHelp: '',
            roleMultiselectHelp: '',
            apiResponseHelp: '',
            availableRoles: availableRoles,
            assignedRoles: assignedRoles,
          });
        }
      }.bind(this));
    }
    else {
      $.get('/manage-users/api/roles/', function(results) {

        if (this.isMounted()) {
          let availableRoles = [];
          for (const roleId in results) {
            availableRoles.push(
              {
                'id': roleId,
                'name': results[roleId].role.name,
              }
            );
          }

          this.setState({
            userEmail: '',
            userEmailHelp: '',
            roleMultiselectHelp: '',
            apiResponseHelp: '',
            availableRoles: availableRoles,
            assignedRoles: [],
          });
        }
      }.bind(this));
    }
  },
  onTextChange(event) {
    this.state.userEmail = event.target.value;

    const userEmail = this.state.userEmail;

    if (validateEmail(userEmail) === false) {
      this.setState({
        userEmail: this.state.userEmail,
        userEmailHelp: 'Invalid email',
        availableRoles: this.refs.roles.state.availableRoles,
        assignedRoles: this.refs.roles.state.assignedRoles,
      });
      return;
    }
    else {
      this.setState({
        userEmail: this.state.userEmail,
        userEmailHelp: '',
        api_response_message: '',
        availableRoles: this.refs.roles.state.availableRoles,
        assignedRoles: this.refs.roles.state.assignedRoles,
      });
      return;
    }
  },
  handleSaveUserClick() {

    {/* Grab form fields and validate */}

    {/* TODO: Warn user? If they remove a user from all roles, they will have to reinvite him. */}

    const userId = this.props.params.userId;

    let assignedRoles = this.refs.roles.state.assignedRoles;

    const userEmail = this.state.userEmail;

    if (validateEmail(userEmail) === false) {
      this.setState({
        userEmailHelp: 'Invalid email.',
        roleMultiselectHelp: '',
        availableRoles: this.refs.roles.state.availableRoles,
        assignedRoles: this.refs.roles.state.assignedRoles,
      });
      return;
    }

    if (assignedRoles.length < 1) {
      this.setState({
        userEmailHelp: '',
        roleMultiselectHelp: 'Each user must be assigned to at least one role.',
        availableRoles: this.refs.roles.state.availableRoles,
        assignedRoles: this.refs.roles.state.assignedRoles,
      });
      return;
    }

    {/* No errors? Clear help text */}

    this.setState({
      availableRoles: this.refs.roles.state.availableRoles,
      assignedRoles: this.refs.roles.state.assignedRoles,
    });

    {/* Format properly */}

    assignedRoles = assignedRoles.map(function(obj) {
      return obj.name;
    });

    {/* Determine URL based on action */}
    const action = this.props.location.query.action;

    let url = '';
    if ( action === 'Edit' ) {
      url = '/manage-users/api/users/edit/' + userId + '/';
    }
    else {
      url = '/manage-users/api/users/create/';
    }

    {/* Build data to send */}
    const dataToSend = {};
    dataToSend.csrfmiddlewaretoken = getCsrf();
    dataToSend.assignedRoles = assignedRoles;
    dataToSend.userEmail = userEmail;

    {/* Submit to server */}
    $.post(url, dataToSend, function(response) {
      if ( response.success === 'true' ) {
        {/* Reload API */}
        this.props.callUsersAPI();
        {/* Redirect user */}
        this.props.history.pushState(null, '/users');
      }
      else if ( response.success === 'false' ) {
        this.setState({
          apiResponseHelp: response.message,
          userEmail: this.state.userEmail,
          availableRoles: this.refs.roles.state.availableRoles,
          assignedRoles: this.refs.roles.state.assignedRoles,
        });
      }
    }.bind(this))
    .fail( function(xhr) {
      if (xhr.status === 403) {
        this.setState({
          apiResponseHelp: 'Unable to save user. Insufficient privileges.',
        });
      }
    }.bind(this));
  },
  handleDeleteUserClick() {
    const history = this.props.history;
    {/* Temporary until I replace $.ajax jQuery with vanilla JS ES6 arrow function */}
    const self = this;

    if (confirm('Are you sure you want to delete this user?')) {
    } else {
      return;
    }

    const userId = this.props.params.userId;

    const csrf = getCsrf();

    {/* Submit to server */}
    $.ajax( '/manage-users/api/users/delete/' + userId + '/',
      {
        type: 'DELETE',
        beforeSend: function(xhr) {
        xhr.setRequestHeader('X-CSRFToken', csrf);
      },
        success: function( ) {
      {/* Reload API */}
      self.props.callUsersAPI();
      {/* Redirect user */}
      history.pushState(null, '/users');
    }})
    .fail( function(xhr) {
      if (xhr.status === 403) {
        this.setState({
          apiResponseHelp: 'User not deleted. Insufficient privileges.',
        });
      }
    }.bind(this));
  },
  render() {

    let deleteUserButton = '';

    let userEmailInput = '';

    const action = this.props.location.query.action;

    if (action === 'Edit') {
      userEmailInput = <input id="id_userEmail" maxLength="255" name="id_userEmail" type="email" readOnly value={this.state.userEmail} size="35"/>;
      deleteUserButton = <Button className="pull-right" onClick={this.handleDeleteUserClick}>Delete User</Button>;
    }
    else {
      userEmailInput = <input id="id_userEmail" maxLength="255" name="id_userEmail" type="email" value={this.state.userEmail} onChange={this.onTextChange} size="35"/>;
    }

    const userEmailHelp = this.state.userEmailHelp;
    const roleMultiselectHelp = this.state.roleMultiselectHelp;
    const apiResponseHelp = this.state.apiResponseHelp;

    return (
      <div>

        <div className="row">
          <div className="col-xs-12">
            <div className="wrapper-header">
              <h2>{action} User</h2>
            </div>
            <div className="product-card-full no-highlight">

              <div className="row">
                <div className="col-xs-12">
                  <HelpText message={userEmailHelp} />
                  <label htmlFor="id_userEmail">User Email*:</label>
                  {userEmailInput}
                </div>
              </div>

              <hr/>

              <HelpText message={roleMultiselectHelp} />

              <RolesMultiselect availableRoles={this.state.availableRoles} assignedRoles={this.state.assignedRoles} ref="roles"/>

              <span id="role_select_help" className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>

              <hr />

              <div className="row">

                <div className="col-xs-12">
                  <span className="primary pull-right">
                    <HelpText message={apiResponseHelp} />
                  </span>
                </div>

                <div className="col-xs-12">
                  <Button className="primary pull-right" onClick={this.handleSaveUserClick}>Save User</Button>
                  {deleteUserButton}
                  <Link to="users" className="pull-right btn btn-default">Cancel</Link>
                </div>
              </div>

            </div>
          </div>
        </div>
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
