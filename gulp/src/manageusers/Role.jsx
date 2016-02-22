/* global $ */

import React from 'react';
import _ from 'lodash-compat';
import {Link} from 'react-router';
import Button from 'react-bootstrap/lib/Button';

import {getCsrf} from 'util/cookie';
import {reverseFormatActivityName} from './reverseFormatActivityName';
import {formatActivityNames} from './formatActivityNames';
import {buildCurrentActivitiesObject} from './buildCurrentActivitiesObject';

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
      $.get('/manage-users/api/roles/' + this.props.params.roleId + '/', function getRole(results) {
        const activities = formatActivityNames(results.activities);

        this.setState({
          apiResponseHelp: '',
          roleName: results.role_name,
          availableUsers: results.available_users,
          assignedUsers: results.assigned_users,
          activities: activities,
        });
      }.bind(this));
    } else {
      // action === 'Add'
      $.get('/manage-users/api/roles/', function addRole(results) {
        // It doesn't matter which role we get
        const roleObject = results[0];

        const activities = formatActivityNames(roleObject.activities);

        // Loop through all app_access's
        // Make sure there are no assigned_activities
        _.forOwn(activities, function resetAssignedActivities(activity) {
          activity.assigned_activities = [];
        });

        this.setState({
          apiResponseHelp: '',
          roleName: '',
          availableUsers: roleObject.available_users,
          assignedUsers: [],
          activities: activities,
        });
      }.bind(this));
    }
  }
  onTextChange(event) {
    this.state.roleName = event.target.value;

    // If we don't include activities when we setState, activities will reset to default
    const currentActivitiesObject = buildCurrentActivitiesObject(this.state, this.refs);

    this.setState({
      apiResponseHelp: '',
      roleNameHelp: '',
      roleName: this.state.roleName,
      availableUsers: this.refs.users.state.availableUsers,
      assignedUsers: this.refs.users.state.assignedUsers,
      activites: currentActivitiesObject,
    });
  }
  handleSaveRoleClick() {
    // Grab form fields and validate
    // TODO: Warn user? If they remove a user from all roles, they will have to reinvite him.

    const roleId = this.props.params.roleId;

    let assignedUsers = this.refs.users.state.assignedUsers;

    const roleName = this.state.roleName;
    if (roleName === '') {
      // If we don't include activities when we setState, activities will reset to default
      const currentActivitiesObject = buildCurrentActivitiesObject(this.state, this.refs);

      this.setState({
        apiResponseHelp: '',
        roleNameHelp: 'Role name empty.',
        activitiesMultiselectHelp: '',
        roleName: this.state.roleName,
        availableUsers: this.refs.users.state.availableUsers,
        assignedUsers: this.refs.users.state.assignedUsers,
        activities: currentActivitiesObject,
      });
      return;
    }

    // Combine all assigned activites
    // This may look complicated because we're building the accordions of
    // activities dynamically. That is, we don't know how many of them or by
    // what ref they go by ahead of time.
    const assignedActivities = [];
    // Loop through all apps
    const refs = this.refs;
    _.forOwn(this.state.activities, function loopThroughGroupedActivities(activity) {
      // Now for each app, loop through all selected activities in its accordion
      // tempRef is the app_access_name without spaces (e.g. User Management
      // becomes UserManagement)
      const tempRef = activity.app_access_name.replace(/\s/g, '');
      const selected = refs.activities.refs[tempRef].state.assignedActivities;
      _.forOwn(selected, function loopThroughEachSelectedActivity(item) {
        assignedActivities.push(item);
      });
    });
    // User must select AT LEAST ONE activity
    if (assignedActivities.length < 1) {
      // If we don't include activities when we setState, activities will reset to default
      const currentActivitiesObject = buildCurrentActivitiesObject(this.state, this.refs);

      this.setState({
        apiResponseHelp: '',
        roleNameHelp: '',
        activitiesMultiselectHelp: 'No activities selected. Each role must have at least one activity.',
        roleName: this.state.roleName,
        availableUsers: this.refs.users.state.availableUsers,
        assignedUsers: this.refs.users.state.assignedUsers,
        activities: currentActivitiesObject,
      });
      return;
    }

    // If we don't include activities when we setState, activities will reset to default
    const currentActivitiesObject = buildCurrentActivitiesObject(this.state, this.refs);

    // No errors? Clear help text
    this.setState({
      apiResponseHelp: '',
      activitiesMultiselectHelp: '',
      roleName: this.state.roleName,
      availableUsers: this.refs.users.state.availableUsers,
      assignedUsers: this.refs.users.state.assignedUsers,
      activities: currentActivitiesObject,
    });

    // Format assigned activities
    let formattedAssignedActivities = [];
    if (assignedActivities) {
      formattedAssignedActivities = assignedActivities.map( obj => {
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
          activitiesMultiselectHelp: '',
          roleName: this.state.roleName,
          availableUsers: this.refs.users.state.availableUsers,
          assignedUsers: this.refs.users.state.assignedUsers,
          activities: currentActivitiesObject,
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
