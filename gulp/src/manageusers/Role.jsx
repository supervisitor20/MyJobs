/* global $ */

import React from 'react';
import {Link} from 'react-router';
import Button from 'react-bootstrap/lib/Button';

import {getCsrf} from 'util/Cookie';

import HelpText from './HelpText';
import ActivitiesMultiselect from './ActivitiesMultiselect';
import UsersMultiselect from './UsersMultiselect';

class Role extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiResponseHelp: '',
      activitiesMultiselectHelp: '',
      roleName: '',
      roleNameHelp: '',
      availableActivities: [],
      assignedActivities: [],
      availableUsers: [],
      assignedUsers: [],
    };
    this.onTextChange = this.onTextChange.bind(this);
    this.handleSaveRoleClick = this.handleSaveRoleClick.bind(this);
    this.handleDeleteRoleClick = this.handleDeleteRoleClick.bind(this);
  }
  componentDidMount() {
    const action = this.props.location.query.action;

    if (action === 'Edit') {
      $.get('/manage-users/api/roles/' + this.props.params.roleId, function getRole(results) {
        const roleObject = results[this.props.params.roleId];

        const roleName = roleObject.role.name;

        const availableUsersUnformatted = JSON.parse(roleObject.users.available);
        const availableUsers = availableUsersUnformatted.map( obj => {
          const user = {};
          user.id = obj.pk;
          user.name = obj.fields.email;
          return user;
        });

        const assignedUsersUnformatted = JSON.parse(roleObject.users.assigned);
        const assignedUsers = assignedUsersUnformatted.map( obj => {
          const user = {};
          user.id = obj.pk;
          user.name = obj.fields.email;
          return user;
        });

        const availableActivitiesUnformatted = JSON.parse(roleObject.activities.available);
        const availableActivities = availableActivitiesUnformatted.map( obj => {
          const activity = {};
          activity.id = obj.pk;
          activity.name = obj.fields.name;
          return activity;
        });

        const assignedActivitiesUnformatted = JSON.parse(roleObject.activities.assigned);
        const assignedActivities = assignedActivitiesUnformatted.map( obj => {
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
      }.bind(this));
    } else {
      $.get('/manage-users/api/roles/', function addRole(results) {
        // Objects in results don't have predictable keys
        // It doesn't matter which one we get
        // Therefore get the first one with a loop
        let roleObject = {};
        for (const key in results) {
          if (results.hasOwnProperty(key)) {
            roleObject = results[key];
            break;
          }
        }

        const availableUsersUnformatted = JSON.parse(roleObject.users.available);
        const availableUsers = availableUsersUnformatted.map( obj => {
          const user = {};
          user.id = obj.pk;
          user.name = obj.fields.email;
          return user;
        });

        const availableActivitiesUnformatted = JSON.parse(roleObject.activities.available);
        const availableActivities = availableActivitiesUnformatted.map( obj => {
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
      }.bind(this));
    }
  }
  onTextChange(event) {
    this.state.roleName = event.target.value;

    // This works, but is cumbersome to scale. For next app, or if we grow this one larger, refactor using Flux.
    // setState overrides some states because they are n-levels deep.
    // Look into immutability: http://facebook.github.io/react/docs/update.html

    this.setState({
      apiResponseHelp: '',
      roleName: this.state.roleName,
      availableActivities: this.refs.activities.state.availableActivities,
      assignedActivities: this.refs.activities.state.assignedActivities,
      availableUsers: this.refs.users.state.availableUsers,
      assignedUsers: this.refs.users.state.assignedUsers,
    });
  }
  handleSaveRoleClick() {
    // Grab form fields and validate
    // TODO: Warn user? If they remove a user from all roles, they will have to reinvite him.

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

    const assignedActivities = this.refs.activities.state.assignedActivities;

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

    // No errors? Clear help text
    this.setState({
      apiResponseHelp: '',
      activitiesMultiselectHelp: '',
      roleName: this.state.roleName,
      availableActivities: this.refs.activities.state.availableActivities,
      assignedActivities: this.refs.activities.state.assignedActivities,
      availableUsers: this.refs.users.state.availableUsers,
      assignedUsers: this.refs.users.state.assignedUsers,
    });

    // Format properly

    const formattedAssignedActivities = assignedActivities.map( obj => {
      return obj.name;
    });

    assignedUsers = assignedUsers.map( obj => {
      return obj.name;
    });

    // Determine URL based on action
    const action = this.props.location.query.action;

    let url = '';
    if ( action === 'Edit' ) {
      url = '/manage-users/api/roles/edit/' + roleId + '/';
    } else {
      url = '/manage-users/api/roles/create/';
    }

    // Build data to send
    const dataToSend = {};
    dataToSend.csrfmiddlewaretoken = getCsrf();
    dataToSend.role_name = roleName;
    dataToSend.assigned_activities = formattedAssignedActivities;
    dataToSend.assigned_users = assignedUsers;

    // Submit to server
    $.post(url, dataToSend, function submitToServer(response) {
      const history = this.props.history;

      // TODO: Render a nice disappearing alert with the disappear_text prop. Use the React CSSTransitionGroup addon.
      // http://stackoverflow.com/questions/33778675/react-make-flash-message-disappear-automatically

      if ( response.success === 'true' ) {
        // Reload API
        this.props.callRolesAPI();
        // Redirect user
        history.pushState(null, '/roles');
      } else if ( response.success === 'false' ) {
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
    .fail( function failGracefully(xhr) {
      if (xhr.status === 403) {
        this.setState({
          apiResponseHelp: 'Unable to save role. Insufficient privileges.',
        });
      }
    }.bind(this));
  }
  handleDeleteRoleClick() {
    const history = this.props.history;
    // Temporary until I replace $.ajax jQuery with vanilla JS ES6 arrow function
    const self = this;

    if (confirm('Are you sure you want to delete this role?') === false) {
      return;
    }

    const roleId = this.props.params.roleId;

    const csrf = getCsrf();

    // Submit to server
    $.ajax( '/manage-users/api/roles/delete/' + roleId + '/', {
      type: 'DELETE',
      beforeSend: function beforeSend(xhr) {
        xhr.setRequestHeader('X-CSRFToken', csrf);
      },
      success: function success() {
        // Reload API
        self.props.callRolesAPI();
        // Redirect the user
        history.pushState(null, '/roles');
      }})
      .fail( function failGracefully(xhr) {
        if (xhr.status === 403) {
          this.setState({
            apiResponseHelp: 'Role not deleted. Insufficient privileges.',
          });
        }
      }.bind(this));
  }
  render() {
    let action = this.props.location.query.action;

    let deleteRoleButton = '';
    if (action === 'Edit') {
      deleteRoleButton = <Button className="pull-right" onClick={this.handleDeleteRoleClick}>Delete Role</Button>;
    } else {
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

              <div className="row">
                <div className="col-xs-12">
                  <hr/>

                  <HelpText message={activitiesMultiselectHelp} />

                  <ActivitiesMultiselect availableActivities={this.state.availableActivities} assignedActivities={this.state.assignedActivities} ref="activities"/>

                  <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>

                  <hr/>

                  <UsersMultiselect availableUsers={this.state.availableUsers} assignedUsers={this.state.assignedUsers} ref="users"/>

                  <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>

                  <hr />
                </div>
              </div>

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
  }
}

Role.propTypes = {
  location: React.PropTypes.object.isRequired,
  params: React.PropTypes.object.isRequired,
  callRolesAPI: React.PropTypes.func,
  history: React.PropTypes.object.isRequired,
};

export default Role;
