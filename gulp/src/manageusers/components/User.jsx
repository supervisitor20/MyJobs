import React from 'react';
import _ from 'lodash-compat';
import Button from 'react-bootstrap/lib/Button';
import {Link} from 'react-router';

import {validateEmail} from 'common/email-validators';

import RolesMultiselect from './RolesMultiselect';
import HelpText from './HelpText';

import {connect} from 'react-redux';
import {runConfirmInPlace} from 'common/actions/confirm-actions';

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiResponseHelp: '',
      userEmail: '',
      userEmailHelp: '',
      roleMultiselectHelp: '',
      availableRoles: [],
      assignedRoles: [],
      api_response_message: '',
    };
    // React components using ES6 no longer autobind 'this' to non React methods
    // Thank you: https://github.com/goatslacker/alt/issues/283
    this.onTextChange = this.onTextChange.bind(this);
    this.handleSaveUserClick = this.handleSaveUserClick.bind(this);
    this.handleDeleteUserClick = this.handleDeleteUserClick.bind(this);
  }
  componentDidMount() {
    this.initialApiLoad();
  }
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
    } else {
      this.setState({
        userEmail: this.state.userEmail,
        userEmailHelp: '',
        api_response_message: '',
        availableRoles: this.refs.roles.state.availableRoles,
        assignedRoles: this.refs.roles.state.assignedRoles,
      });
    }
  }
  async initialApiLoad() {
    const {api} = this.props;
    const {action} = this.props.location.query;

    if (action === 'Edit') {
      const results = await api.get('/manage-users/api/users/' + this.props.params.userId + '/');
      const userObject = results[this.props.params.userId];

      const userEmail = userObject.email;

      const availableRolesUnformatted = JSON.parse(userObject.roles.available);
      const availableRoles = availableRolesUnformatted.map( obj => {
        const role = {};
        role.id = obj.pk;
        role.name = obj.fields.name;
        return role;
      });

      const assignedRolesUnformatted = JSON.parse(userObject.roles.assigned);
      const assignedRoles = assignedRolesUnformatted.map( obj => {
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
    } else {
      // action === 'Add'
      const results = await api.get('/manage-users/api/roles/');
      const availableRoles = [];
      _.forOwn(results, function buildListOfAvailableRoles(role) {
        availableRoles.push(
          {
            'id': role.role_id,
            'name': role.role_name,
          }
        );
      });
      this.setState({
        userEmail: '',
        userEmailHelp: '',
        roleMultiselectHelp: '',
        apiResponseHelp: '',
        availableRoles: availableRoles,
        assignedRoles: [],
      });
    }
  }
  async handleSaveUserClick() {
    // Grab form fields and validate
    // TODO: Warn user? If they remove a user from all roles, they will have to reinvite him.
    const {api, rolesAPIResults} = this.props;
    const userId = this.props.params.userId;
    const currentUserId = this.props.currentUserId;

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
        assignedRoles: assignedRoles,
      });
      return;
    }

    // If a user is editing their own account, they must have at least one role
    // with the 'read role' activity, otherwise they'll be kicked out of
    // manage users.

    // Is user editing their own account?
    if (parseInt(userId, 10) === parseInt(currentUserId, 10)) {
      // What roles are currently assigned?
      const assignedRolesAsStrings = _.map(assignedRoles, role => role.name);

      // Do any of the currently assigned roles contain the 'read role' activity?
      let containsReadRoleActivity = false;
      // Loop through all roles
      containsReadRoleActivity = _.some(rolesAPIResults, role => {
        // Identify the roles which are currently assigned
        if (_.includes(assignedRolesAsStrings, role.role_name)) {
          // For each currently assigned role, determine if the 'read role'
          // activity is associated with it
          return _.some(role.activities, activity => {
            return _.some(activity.assigned_activities, assignedActivity => assignedActivity.name === 'read role');
          });
        }
      }
    );
      if (containsReadRoleActivity === false) {
        this.setState({
          userEmailHelp: '',
          roleMultiselectHelp: 'You must have at least one role that has the \'read role\' activity.',
          availableRoles: this.refs.roles.state.availableRoles,
          assignedRoles: assignedRoles,
        });
        return;
      }
    }

    // No errors? Clear help text
    this.setState({
      availableRoles: this.refs.roles.state.availableRoles,
      assignedRoles: this.refs.roles.state.assignedRoles,
    });

    // Format properly
    assignedRoles = assignedRoles.map( obj => {
      return obj.name;
    });

    // Determine URL based on action
    const action = this.props.location.query.action;

    let url = '';
    if ( action === 'Edit' ) {
      url = '/manage-users/api/users/edit/' + userId + '/';
    } else {
      url = '/manage-users/api/users/create/';
    }

    // Build data to send
    const dataToSend = {};
    dataToSend.assigned_roles = assignedRoles;
    dataToSend.user_email = userEmail;

    // Submit to server
    try {
      const response = await api.post(url, dataToSend);
      if ( response.success === 'true' ) {
        // Reload API
        this.props.callUsersAPI();
        // Redirect user
        this.props.history.pushState(null, '/users');
      } else if ( response.success === 'false' ) {
        this.setState({
          apiResponseHelp: response.message,
          userEmail: this.state.userEmail,
          availableRoles: this.refs.roles.state.availableRoles,
          assignedRoles: this.refs.roles.state.assignedRoles,
        });
      }
    } catch (e) {
      if (e.response && e.response.status === 403) {
        this.setState({
          apiResponseHelp: 'Unable to save user. Insufficient privileges.',
        });
      }
    }
  }
  async handleDeleteUserClick() {
    const {history, api, currentUserId, dispatch} = this.props;
    const userId = this.props.params.userId;

    // Is user trying to delete their own account?
    if (parseInt(userId, 10) === parseInt(currentUserId, 10)) {
      this.setState({
        roleMultiselectHelp: 'You cannot delete your own user.',
      });
      return;
    }

    const message = 'Are you sure you want to delete this user?';
    if (! await runConfirmInPlace(dispatch, message)) {
      return;
    }

    // Submit to server
    try {
      await api.delete('/manage-users/api/users/delete/' + userId + '/');
      await this.props.callUsersAPI();
      history.pushState(null, '/users');
    } catch (e) {
      if (e.response && e.response.status === 403) {
        this.setState({
          apiResponseHelp: 'User not deleted. Insufficient privileges.',
        });
      }
    }
  }
  render() {
    let deleteUserButton = '';

    let userEmailEdit = '';

    const action = this.props.location.query.action;

    if (action === 'Edit') {
      userEmailEdit = true;
      deleteUserButton = <Button className="pull-right" onClick={this.handleDeleteUserClick}>Delete User</Button>;
    } else {
      userEmailEdit = false;
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

              <div className="row no-gutter">
                <label htmlFor="id_userEmail" className="col-sm-2 control-label">User Email* </label>
                <input id="id_userEmail" className="col-sm-6" maxLength="255" name="id_userEmail" type="email" readOnly={userEmailEdit} autoFocus={!userEmailEdit} value={this.state.userEmail} onChange={this.onTextChange} size="35" />
                <HelpText message={userEmailHelp} styleName="col-sm-4" />
              </div>

              <div className="row">
                <div className="col-xs-12">
                  <HelpText message={roleMultiselectHelp} />
                  <RolesMultiselect availableRoles={this.state.availableRoles} assignedRoles={this.state.assignedRoles} ref="roles"/>
                  <span id="role_select_help" className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>
                </div>
              </div>

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
  }
}

User.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  location: React.PropTypes.object.isRequired,
  params: React.PropTypes.object.isRequired,
  callUsersAPI: React.PropTypes.func,
  history: React.PropTypes.object.isRequired,
  api: React.PropTypes.object,
  rolesAPIResults: React.PropTypes.array,
  currentUserId: React.PropTypes.number,
};

export default connect()(User);
