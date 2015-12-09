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
      availablePRMActivities: [],
      assignedPRMActivities: [],
      availableUserManagementActivities: [],
      assignedUserManagementActivities: [],
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

        // Create availableUsers
        const availableUsersParsed = JSON.parse(roleObject.users.available);

        const availableUsers = formatForMultiselect(availableUsersParsed);
        console.log("availableUsers");
        console.log(availableUsers);
        // Create assignedUsers
        const assignedUsersParsed = JSON.parse(roleObject.users.assigned);
        const assignedUsers = formatForMultiselect(assignedUsersParsed);

        const availableActivitiesParsed = JSON.parse(roleObject.activities.available);
        const assignedActivitiesParsed = JSON.parse(roleObject.activities.assigned);

        // Create availablePRMActivities
        let availablePRMActivities = filterActivitiesForAppAccess(availableActivitiesParsed, 1);

        availablePRMActivities = formatForMultiselect(availablePRMActivities);

        // Create assignedPRMActivities
        let assignedPRMActivities = filterActivitiesForAppAccess(assignedActivitiesParsed, 1);
        assignedPRMActivities = formatForMultiselect(assignedPRMActivities);

        // Create availableUserManagementActivities
        let availableUserManagementActivities = filterActivitiesForAppAccess(availableActivitiesParsed, 2);
        availableUserManagementActivities = formatForMultiselect(availableUserManagementActivities);

        // Create assignedUserManagementActivities
        let assignedUserManagementActivities = filterActivitiesForAppAccess(assignedActivitiesParsed, 2);
        assignedUserManagementActivities = formatForMultiselect(assignedUserManagementActivities);

        this.setState({
          apiResponseHelp: '',
          roleName: roleName,
          availablePRMActivities: availablePRMActivities,
          assignedPRMActivities: assignedPRMActivities,
          availableUserManagementActivities: availableUserManagementActivities,
          assignedUserManagementActivities: assignedUserManagementActivities,
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
      availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
      assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
      availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
      assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
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
        availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
        assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
        availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
        assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
        availableUsers: this.refs.users.state.availableUsers,
        assignedUsers: this.refs.users.state.assignedUsers,
      });
      return;
    };

    // Combine all assigned activites
    const assignedPRMActivities = this.refs.activitiesPRM.state.assignedActivities;
    const assignedUserManagementActivities = this.refs.activitiesUserManagement.state.assignedActivities;
    const assignedActivities = assignedPRMActivities.concat(assignedUserManagementActivities);

    // User must select AT LEAST ONE activity
    if (assignedActivities.length < 1) {
      this.setState({
        apiResponseHelp: '',
        activitiesMultiselectHelp: 'No activities selected. Each role must have at least one activity.',
        roleName: this.state.roleName,
        availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
        assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
        availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
        assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
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
      availablePRMActivities: this.refs.activitiesPRM.state.availableActivities,
      assignedPRMActivities: this.refs.activitiesPRM.state.assignedActivities,
      availableUserManagementActivities: this.refs.activitiesUserManagement.state.availableActivities,
      assignedUserManagementActivities: this.refs.activitiesUserManagement.state.assignedActivities,
      availableUsers: this.refs.users.state.availableUsers,
      assignedUsers: this.refs.users.state.assignedUsers,
    });

    // Format assigned activities
    let formattedAssignedActivities = [];
    if(assignedActivities) {
      formattedAssignedActivities = assignedActivities.map( obj => {
        return reverseFormatActivityName(obj.name);
      });
    };

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

                  <label>Activities:</label>

                  <HelpText message={activitiesMultiselectHelp} />

                  <Accordion>
                    <Panel header="PRM" eventKey="1">
                      <ActivitiesMultiselect availableActivities={this.state.availablePRMActivities} assignedActivities={this.state.assignedPRMActivities} ref="activitiesPRM"/>
                      <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>
                    </Panel>
                    <Panel header="User Management" eventKey="2">
                      <ActivitiesMultiselect availableActivities={this.state.availableUserManagementActivities} assignedActivities={this.state.assignedUserManagementActivities} ref="activitiesUserManagement"/>
                      <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>
                    </Panel>
                  </Accordion>

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
