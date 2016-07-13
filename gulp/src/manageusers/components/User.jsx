import React from 'react';
import _ from 'lodash-compat';
import {difference} from 'lodash-compat';
import unionBy from 'lodash.unionby';
import {Button, Col, FormControl, Row} from 'react-bootstrap';
import {Link} from 'react-router';
import TagSelect from 'common/ui/tags/TagSelect';
import FieldWrapper from 'common/ui/FieldWrapper';

import {validateEmail} from 'common/email-validators';

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
      });
    } else {
      this.setState({
        userEmail: this.state.userEmail,
        userEmailHelp: '',
        api_response_message: '',
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
        role.value = obj.pk;
        role.display = obj.fields.name;
        return role;
      });

      const assignedRolesUnformatted = JSON.parse(userObject.roles.assigned);
      const assignedRoles = assignedRolesUnformatted.map( obj => {
        const role = {};
        role.value = obj.pk;
        role.display = obj.fields.name;
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
            'value': role.role_id,
            'display': role.role_name,
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
    // Grab form fields and validate TODO: Warn user? If they remove a user
    // from all roles, they will have to reinvite him.
    const {api} = this.props;
    const userId = this.props.params.userId;
    const userEmail = this.state.userEmail;

    let assignedRoles = this.state.assignedRoles;


    if (assignedRoles.length < 1) {
      this.setState({
        userEmailHelp: '',
        roleMultiselectHelp: 'A user must be assigned to at least one role.',
      });
      return;
    }

    // Format properly
    assignedRoles = assignedRoles.map( obj => {
      return obj.display;
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
    const {history, api, dispatch} = this.props;
    const userId = this.props.params.userId;

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

  handleChoose(roles) {
    const {assignedRoles} = this.state;
    this.setState({assignedRoles: unionBy(roles, assignedRoles, 'display')});
  }

  handleRemove(roles) {
    const {assignedRoles} = this.state;
    this.setState({assignedRoles: difference(assignedRoles, roles)});
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
      <Row>
        <Col xs={12}>
          <div className="wrapper-header">
            <h2>{action} User</h2>
          </div>
          <div className="product-card-full no-highlight">
            <FieldWrapper
              label="User Email"
              helpText={userEmailHelp}
              required>
              <FormControl
                id="id_userEmail"
                maxLength="255"
                name="id_userEmail"
                type="email"
                readOnly={userEmailEdit}
                autoFocus={!userEmailEdit}
                value={this.state.userEmail}
                onChange={this.onTextChange}
                size="35" />
            </FieldWrapper>
            <FieldWrapper
              label="Roles"
              helpText={roleMultiselectHelp}
              required>
              <TagSelect
                available={this.state.availableRoles}
                selected={this.state.assignedRoles}
                onChoose={roles => this.handleChoose(roles)}
                onRemove={roles => this.handleRemove(roles)}
                ref="roles" />
            </FieldWrapper>

            <Row>
              <Col xs={12}>
                <span className="primary pull-right">
                  <HelpText message={apiResponseHelp} />
                </span>
              </Col>

              <Col xs={12}>
                <Button
                  className="primary pull-right"
                  onClick={this.handleSaveUserClick}>
                  Save User
                </Button>
                {deleteUserButton}
                <Link to="users" className="pull-right btn btn-default">
                  Cancel
                </Link>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
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
};

export default connect()(User);
