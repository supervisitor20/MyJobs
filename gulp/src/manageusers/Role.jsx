/* global $ */

import React from 'react';
import {Link} from 'react-router';
import Button from 'react-bootstrap/lib/Button';
import Accordion from 'react-bootstrap/lib/Accordion';
import Panel from 'react-bootstrap/lib/Panel';

import {getCsrf} from 'util/cookie';
import {reverseFormatActivityName} from 'util/reverseFormatActivityName';
import {formatForMultiselect} from 'util/formatForMultiselect';
import {filterActivitiesForAppAccess} from 'util/filterActivitiesForAppAccess';

import HelpText from './HelpText';
import ActivitiesAccordion from './ActivitiesAccordion';

import UsersMultiselect from './UsersMultiselect';

class Role extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiResponseHelp: '',
      activitiesMultiselectHelp: '',
      roleName: '',
      roleNameHelp: '',
      availablePRMActivities: [],
      assignedPRMActivities: [],
      availableUserManagementActivities: [],
      assignedUserManagementActivities: [],
      availableUsers: [],
      assignedUsers: [],
      activities: [],
    };
    this.onTextChange = this.onTextChange.bind(this);
    this.handleSaveRoleClick = this.handleSaveRoleClick.bind(this);
    this.handleDeleteRoleClick = this.handleDeleteRoleClick.bind(this);
  }
  componentDidMount() {
    const action = this.props.location.query.action;

    if (action === 'Edit') {
      $.get('/manage-users/api/roles/' + this.props.params.roleId, function getRole(results) {
        const roleName = results.role_name;
        const availableUsers = results.available_users;
        const assignedUsers = results.assigned_users;
        const activities = results.activities;

        this.setState({
          apiResponseHelp: '',
          roleName: roleName,
          // availablePRMActivities: availablePRMActivities,
          // assignedPRMActivities: assignedPRMActivities,
          // availableUserManagementActivities: availableUserManagementActivities,
          // assignedUserManagementActivities: assignedUserManagementActivities,
          availableUsers: availableUsers,
          assignedUsers: assignedUsers,
          activities: activities,
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

        // TODO do what I did to /roles/ too

        // Create availableUsers
        const availableUsersParsed = JSON.parse(roleObject.users.available);
        const availableUsers = formatForMultiselect(availableUsersParsed);

        // Begin creating activities
        const availableActivitiesParsed = JSON.parse(roleObject.activities.available);

        // Create availablePRMActivities
        let availablePRMActivities = filterActivitiesForAppAccess(availableActivitiesParsed, 1);
        availablePRMActivities = formatForMultiselect(availablePRMActivities);

        // Create availableUserManagementActivities
        let availableUserManagementActivities = filterActivitiesForAppAccess(availableActivitiesParsed, 2);
        availableUserManagementActivities = formatForMultiselect(availableUserManagementActivities);

        this.setState({
          apiResponseHelp: '',
          availablePRMActivities: availablePRMActivities,
          availableUserManagementActivities: availableUserManagementActivities,
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
      // availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
      // assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
      // availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
      // assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
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
        // availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
        // assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
        // availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
        // assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
        availableUsers: this.refs.users.state.availableUsers,
        assignedUsers: this.refs.users.state.assignedUsers,
      });
      return;
    }

    // Combine all assigned activites
    // This may look complicated, because we're building the accordions of
    // activities dynamically. That is, we don't know how many of them or by
    // what ref they go by ahead of time.
    const assignedActivities = [];
    // Loop through all apps
    for (const i in this.state.activities) {
      // Now for each app, loop through all selected activities in its accordion
      // tempRef is the app_access_name without spaces (e.g. User Management
      // becomes UserManagement)
      let tempRef = this.state.activities[i].app_access_name.replace(/\s/g, '');
      let assigned_activities = this.refs.activities.refs[tempRef].state.assignedActivities;
      for (const j in assigned_activities) {
        assignedActivities.push(assigned_activities[j])
      }
    }

    console.log("assignedActivities");
    console.log(assignedActivities);

    // User must select AT LEAST ONE activity
    if (assignedActivities.length < 1) {
      this.setState({
        apiResponseHelp: '',
        activitiesMultiselectHelp: 'No activities selected. Each role must have at least one activity.',
        roleName: this.state.roleName,
        // TODO Daniel: how to set state when this.state.activities is not 'shallow'?
        // availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
        // assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
        // availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
        // assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
        // availableUsers: this.refs.users.state.availableUsers,
        // assignedUsers: this.refs.users.state.assignedUsers,
        // activities: this.activities,
      });
      return;
    }

    // No errors? Clear help text
    this.setState({
      apiResponseHelp: '',
      activitiesMultiselectHelp: '',
      roleName: this.state.roleName,
      // TODO Daniel: how to set state when this.state.activities is not 'shallow'?
      // availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
      // assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
      // availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
      // assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
      // availableUsers: this.refs.users.state.availableUsers,
      // assignedUsers: this.refs.users.state.assignedUsers,
    });

    // Format assigned activities
    let formattedAssignedActivities = [];
    if (assignedActivities) {
      formattedAssignedActivities = assignedActivities.map( obj => {
        console.log("original word is:")
        console.log(obj.name);
        console.log("after transformation it is");
        console.log(reverseFormatActivityName(obj.name));
        return reverseFormatActivityName(obj.name);
      });
    }

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

    console.log("dataToSend is");
    console.log(dataToSend);

    return;


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
          availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
          assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
          availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
          assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
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
              <div className="row no-gutter">
                  <label htmlFor="id_role_name" className="col-sm-3 control-label">Role Name* </label>
                  <input id="id_role_name" className="col-sm-5" maxLength="255" name="name" type="text" value={this.state.roleName} size="35" onChange={this.onTextChange}/>
                  <HelpText message={roleNameHelp} styleName="col-sm-4" />
              </div>

              <div className="row">
                <div className="col-xs-12">

                  <label>Activities:</label>

                  <HelpText message={activitiesMultiselectHelp} />

                  <ActivitiesAccordion activities={this.state.activities} ref="activities"/>

                  <UsersMultiselect availableUsers={this.state.availableUsers} assignedUsers={this.state.assignedUsers} ref="users"/>

                  <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>
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
