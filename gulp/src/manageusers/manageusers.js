import React from "react";
import ReactDOM from "react-dom";
import {getCsrf} from 'util/cookie';
import {validateEmail} from 'util/validateEmail';
import Button from 'react-bootstrap/lib/Button';
import FilteredMultiSelect from "react-filtered-multiselect"



// This is the entry point of the application. Bundling begins here.


var HelpText = React.createClass({
  render: function() {
    var message = this.props.message;
    return (
      <div className="input-error">
        {message}
      </div>
    );
  }
});


var EditUserPage = React.createClass({
  getInitialState: function() {
    {/* TODO Refactor to use basic Actions and the Dispatchers */}
    return {
      api_response_help: '',
      user_email: '',
      user_email_help: '',
      role_multiselect_help: '',
      available_roles: [],
      assigned_roles: [],
      api_response_message: ''
    };
  },
  onTextChange: function(event) {
    this.state.user_email = event.target.value;

    var user_email = this.state.user_email;

    if(validateEmail(user_email) === false) {
      this.setState({
          user_email: this.state.user_email,
          user_email_help: 'Invalid email',
          available_roles: this.refs.roles.state.available_roles,
          assigned_roles: this.refs.roles.state.assigned_roles
      });
      return;
    }
    else {
      this.setState({
          user_email: this.state.user_email,
          user_email_help: '',
          api_response_message: '',
          available_roles: this.refs.roles.state.available_roles,
          assigned_roles: this.refs.roles.state.assigned_roles
      });
      return;
    }
  },
  componentDidMount: function() {
    if(this.props.action == "Edit"){
      $.get("/manage-users/api/users/" + this.props.user_id, function(results) {

        if (this.isMounted()) {

          var user_object = results[this.props.user_id];

          var user_email = user_object.email;

          var available_roles_unformatted = JSON.parse(user_object.roles.available);
          var available_roles = available_roles_unformatted.map(function(obj){
             var role = {};
             role['id'] = obj.pk;
             role['name'] = obj.fields.name;
             return role;
          });

          var assigned_roles_unformatted = JSON.parse(user_object.roles.assigned);
          var assigned_roles = assigned_roles_unformatted.map(function(obj){
             var role = {};
             role['id'] = obj.pk;
             role['name'] = obj.fields.name;
             return role;
          });

          this.setState({
            user_email: user_email,
            user_email_help: '',
            role_multiselect_help: '',
            api_response_help: '',
            available_roles: available_roles,
            assigned_roles: assigned_roles
          });
        }
      }.bind(this));
    }

    else if(this.props.action == "Add"){

      $.get("/manage-users/api/roles/", function(results) {

        if (this.isMounted()) {

          available_roles = [];
          for (var role_id in results){
            available_roles.push(
              {
                "id":role_id,
                "name":results[role_id].role.name
              }
            )
          };

          var user_email = "";
          var available_roles = available_roles;
          var assigned_roles = [];

          this.setState({
            user_email: user_email,
            user_email_help: '',
            role_multiselect_help: '',
            api_response_help: '',
            available_roles: available_roles,
            assigned_roles: assigned_roles
          });
        }
      }.bind(this));
    }

  },
  handleSaveUserClick: function (event) {

    {/* Grab form fields and validate */}

    {/* TODO: Warn user? If they remove a user from all roles, they will have to reinvite him. */}

    var user_id = this.props.user_id;

    var assigned_roles = this.refs.roles.state.assigned_roles;

    var user_email = this.state.user_email;

    if(validateEmail(user_email) === false) {
      this.setState({
          user_email_help: 'Invalid email.',
          role_multiselect_help: '',
          available_roles: this.refs.roles.state.available_roles,
          assigned_roles: this.refs.roles.state.assigned_roles
      });
      return;
    }

    if(assigned_roles.length < 1){
      this.setState({
          user_email_help: '',
          role_multiselect_help: 'Each user must be assigned to at least one role.',
          available_roles: this.refs.roles.state.available_roles,
          assigned_roles: this.refs.roles.state.assigned_roles
      });
      return;
    }

    {/* No errors? Clear help text */}

    this.setState({
        available_roles: this.refs.roles.state.available_roles,
        assigned_roles: this.refs.roles.state.assigned_roles
    });

    {/* Format properly */}

    assigned_roles = assigned_roles.map(function(obj){
       return obj.name;
    });

    {/* Determine URL based on action */}
    var url = "";
    if ( this.props.action == "Edit" ){
      url = "/manage-users/api/users/edit/" + user_id + "/";
    }
    else if ( this.props.action == "Add" ){
      url = "/manage-users/api/users/create/";
    }

    {/* Build data to send */}
    var data_to_send = {};
    data_to_send['csrfmiddlewaretoken'] = getCsrf();
    data_to_send['assigned_roles'] = assigned_roles;
    data_to_send['user_email'] = user_email;

    {/* Submit to server */}
    $.post(url, data_to_send, function(response) {
      if ( response.success == "true" ){
        ReactDOM.render(
          <Container page="Users" reload_apis="true" disappear_text="User created successfully"/>,
            document.getElementById('content')
        );
      }
      else if ( response.success == "false" ){
        console.log(response);

        this.setState({
            api_response_help: response.message,
            user_email: this.state.user_email,
            available_roles: this.refs.roles.state.available_roles,
            assigned_roles: this.refs.roles.state.assigned_roles
        });
      }
    }.bind(this));
  },
  handleDeleteUserClick: function (event) {
    if (confirm('Are you sure you want to delete this user?')) {
    } else {
        return;
    }

    var user_id = this.props.user_id;

    var csrf = getCsrf();

    {/* Submit to server */}

    $.ajax( "/manage-users/api/users/delete/" + user_id + "/",
      {
        type: "DELETE",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-CSRFToken", csrf);
        },
     success: function( response ) {
       ReactDOM.render(
         <Container page="Users" reload_apis="true" disappear_text="User deleted successfully"/>,
           document.getElementById('content')
       );
    }});
  },
  render: function() {

    var delete_user_button = "";

    var user_email_input = "";

    if (this.props.action == "Add") {
      user_email_input = <input id="id_user_email" maxLength="255" name="id_user_email" type="email" value={this.state.user_email} onChange={this.onTextChange} size="35"/>
    }
    else if (this.props.action == "Edit"){
      user_email_input = <input id="id_user_email" maxLength="255" name="id_user_email" type="email" readOnly value={this.state.user_email} size="35"/>
      delete_user_button = <Button className="pull-right" onClick={this.handleDeleteUserClick}>Delete User</Button>
    }

    var user_email_help = this.state.user_email_help;
    var role_multiselect_help = this.state.role_multiselect_help;
    var api_response_help = this.state.api_response_help;

    return (
      <div>

        <div className="row">
          <div className="col-xs-12 ">
            <div className="wrapper-header">
              <h2>{this.props.action} User</h2>
            </div>
            <div className="product-card-full no-highlight">

              <div className="row">
                <div className="col-xs-12">
                  <HelpText message={user_email_help} />
                  <label htmlFor="id_user_email">User Email*:</label>
                  {user_email_input}
                </div>
              </div>

              <hr/>

              <HelpText message={role_multiselect_help} />

              <RolesMultiselect available_roles={this.state.available_roles} assigned_roles={this.state.assigned_roles} ref="roles"/>

              <span id="role_select_help" className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>

              <hr />

              <div className="row">

                <div className="col-xs-12">
                  <span className="primary pull-right">
                    <HelpText message={api_response_help} />
                  </span>
                </div>

                <div className="col-xs-12">
                  <Button className="primary pull-right" onClick={this.handleSaveUserClick}>Save User</Button>
                  {delete_user_button}
                  <CancelUserButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var Status = React.createClass({
  render: function() {
    var button = "";
    if (this.props.status == true){
      button = <span className='label label-success'>Active</span>;
    }
    else if (this.props.status == false){
      button = <span className='label label-warning'>Pending</span>;
    }
    return (
      <span>
        {button}
      </span>
    );
  }
});

var AssociatedRolesList = React.createClass({
  render: function() {
    var associated_roles_list = [];
    for (var key in this.props.roles) {
      associated_roles_list.push(
        <li key={this.props.roles[key].pk}>
          {this.props.roles[key].fields.name}
        </li>
      );
    };
    return (
      <ul>
        {associated_roles_list}
      </ul>
    );
  }
});

var UsersList = React.createClass({
  render: function() {
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
            {this.props.users_table_rows}
          </tbody>
        </table>
      </div>
    );
  }
});

var UsersPage = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Users</h2>
          </div>
          <div className="product-card-full no-highlight">

            <UsersList users_table_rows={this.props.users_table_rows} />

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
  }
});

var AssociatedUsersList = React.createClass({
  render: function() {
    var associated_users_list = [];
    for (var key in this.props.users) {
      associated_users_list.push(
        <li key={key}>
            {this.props.users[key].fields.email}
        </li>
      );
    };
    return (
      <ul>
        {associated_users_list}
      </ul>
    );
  }
});

var AssociatedActivitiesList = React.createClass({
  render: function() {
    var associated_activities_list = [];
    for (var key in this.props.activities) {
      associated_activities_list.push(
        <li key={this.props.activities[key].pk}>
          {this.props.activities[key].fields.name}
        </li>
      );
    };
    return (
      <ul>
        {associated_activities_list}
      </ul>
    );
  }
});

var RolesList = React.createClass({
  handleEditClick: function(role_id) {
    ReactDOM.render(
      <Container page="EditRole"  action="Edit" role_id={role_id}/>,
        document.getElementById('content')
    );
  },
  render: function() {
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
            {this.props.roles_table_rows}
          </tbody>
        </table>
      </div>
    );
  }
});

var ActivitiesList = React.createClass({
  render: function() {
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
            {this.props.activities_table_rows}
          </tbody>
        </table>
      </div>
    );
  }
});

var CancelRoleButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
      <Container page="Roles" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="pull-right" onClick={this.handleClick}>Cancel</Button>
    );
  }
});

var AddUserButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
      <Container page="EditUser" action="Add"/>,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="primary pull-right" onClick={this.handleClick}>Add User</Button>
    );
  }
});

var AddRoleButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
      <Container page="EditRole" action="Add"/>,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="primary pull-right" onClick={this.handleClick}>Add Role</Button>
    );
  }
});

var CancelUserButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
      <Container page="Users" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="pull-right" onClick={this.handleClick}>Cancel</Button>
    );
  }
});

var DeleteUserButton = React.createClass({
  handleClick: function(event) {
    {/* TODO: Actually delete user
        TODO: Warn with a modal, are you sure you want to delete user? */}

    ReactDOM.render(
      <Container page="Users" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="pull-right" onClick={this.handleClick}>Delete Users</Button>
    );
  }
});

var AddUserButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
    	<Container page="EditUser"  action="Add" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="primary pull-right"  onClick={this.handleClick}>Add User</Button>
    );
  }
});

var RolesButton = React.createClass({
  handleClick: function(event) {

    ReactDOM.render(
    	<Container page="Roles" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button onClick={this.handleClick}>Roles</Button>
    );
  }
});

var ActivitiesButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
    	<Container page="Activities" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button onClick={this.handleClick}>Activities</Button>
    );
  }
});

var UsersButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
    	<Container page="Users" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button onClick={this.handleClick}>Users</Button>
    );
  }
});

var UserInvitationEmailForm = React.createClass({
  render: function() {

    var user_invitation_email_template = "You were invited to be a user in an application by DirectEmployers Association.\n\nPlease click the following link to confirm:\n\n[DYNAMIC LINK WILL GO HERE]";

    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <label htmlFor="id_invitation_email">Invitation Email to User:</label>
            <textarea id="id_invitation_email" name="id_invitation_email" type="textarea" rows="10" defaultValue={user_invitation_email_template} aria-describedby="invitation_email_help">

            </textarea>
            <p id="inivitation_email_help" className="help-text">The invitation will automatically include a link for this user to confirm their account.</p>
          </div>
        </div>
        <hr/>
      </div>
    );
  }
});







var RolesMultiselect = React.createClass({
  getInitialState() {
    return {
      assigned_roles: this.props.assigned_roles,
      available_roles: this.props.available_roles,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      available_roles: nextProps.available_roles,
      assigned_roles: nextProps.assigned_roles
    });
  },
  _onSelect(assigned_roles) {
    assigned_roles.sort((a, b) => a.id - b.id)
    this.setState({assigned_roles})
  },
  _onDeselect(deselectedOptions) {
    var assigned_roles = this.state.assigned_roles.slice()
    deselectedOptions.forEach(option => {
      assigned_roles.splice(assigned_roles.indexOf(option), 1)
    })
    this.setState({assigned_roles})
  },
  render: function() {
    var {assigned_roles, available_roles} = this.state

    return (
        <div className="row">
          <div className="col-xs-6">
            <label>Roles Available:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={available_roles}
              selectedOptions={assigned_roles}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Roles Assigned:</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control'
              , select: 'form-control'
              , button: 'btn btn btn-block btn-default'
              , buttonActive: 'btn btn btn-block btn-danger'
              }}
              onChange={this._onDeselect}
              options={assigned_roles}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  }
});






var bootstrapClasses = {
  filter: 'form-control',
  select: 'form-control',
  button: 'btn btn btn-block btn-default',
  buttonActive: 'btn btn btn-block btn-primary'
}

var ActivitiesMultiselect = React.createClass({
  getInitialState() {
    return {
      available_activities: this.props.available_activities,
      assigned_activities: this.props.assigned_activities,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      available_activities: nextProps.available_activities,
      assigned_activities: nextProps.assigned_activities
    });
  },
  _onSelect(assigned_activities) {
    assigned_activities.sort((a, b) => a.id - b.id)
    this.setState({assigned_activities})
  },
  _onDeselect(deselectedOptions) {
    var assigned_activities = this.state.assigned_activities.slice()
    deselectedOptions.forEach(option => {
      assigned_activities.splice(assigned_activities.indexOf(option), 1)
    })
    this.setState({assigned_activities})
  },
  render: function() {
    var {assigned_activities, available_activities} = this.state

    return (
        <div className="row">

          <div className="col-xs-6">
            <label>Activities Available:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={available_activities}
              selectedOptions={assigned_activities}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Activities Assigned:</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control'
              , select: 'form-control'
              , button: 'btn btn btn-block btn-default'
              , buttonActive: 'btn btn btn-block btn-danger'
              }}
              onChange={this._onDeselect}
              options={assigned_activities}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  }
});

var UsersMultiselect = React.createClass({
  getInitialState() {
    return {
      assigned_users: this.props.assigned_users,
      available_users: this.props.available_users,
    }
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      available_users: nextProps.available_users,
      assigned_users: nextProps.assigned_users
    });
  },
  _onSelect(assigned_users) {
    assigned_users.sort((a, b) => a.id - b.id)
    this.setState({assigned_users})
  },
  _onDeselect(deselectedOptions) {
    var assigned_users = this.state.assigned_users.slice()
    deselectedOptions.forEach(option => {
      assigned_users.splice(assigned_users.indexOf(option), 1)
    })
    this.setState({assigned_users})
  },
  render: function() {
    var {assigned_users, available_users} = this.state

    return (
        <div className="row">
          <div className="col-xs-6">
            <label>Users Available:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={available_users}
              selectedOptions={assigned_users}
              textProp="name"
              valueProp="id"
            />
          </div>
          <div className="col-xs-6">
            <label>Users Assigned:</label>
            <FilteredMultiSelect
              buttonText="Remove"
              classNames={{
                filter: 'form-control'
              , select: 'form-control'
              , button: 'btn btn btn-block btn-default'
              , buttonActive: 'btn btn btn-block btn-danger'
              }}
              onChange={this._onDeselect}
              options={assigned_users}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  }
});

var EditRolePage = React.createClass({
  getInitialState: function() {
    {/* TODO Refactor to use basic Actions and the Dispatchers */}
    return {
      api_response_help: '',
      role_name: '',
      available_activities: [],
      assigned_activities: [],
      available_users: [],
      assigned_users: []
    };
  },
  componentDidMount: function() {
    if(this.props.action == "Edit"){

      $.get("/manage-users/api/roles/" + this.props.role_id, function(results) {
        if (this.isMounted()) {

          var role_object = results[this.props.role_id];

          var role_name = role_object.role.name;

          var available_users_unformatted = JSON.parse(role_object.users.available);
          var available_users = available_users_unformatted.map(function(obj){
             var user = {};
             user['id'] = obj.pk;
             user['name'] = obj.fields.email;
             return user;
          });

          var assigned_users_unformatted = JSON.parse(role_object.users.assigned);
          var assigned_users = assigned_users_unformatted.map(function(obj){
             var user = {};
             user['id'] = obj.pk;
             user['name'] = obj.fields.email;
             return user;
          });

          var available_activities_unformatted = JSON.parse(role_object.activities.available);
          var available_activities = available_activities_unformatted.map(function(obj){
             var activity = {};
             activity['id'] = obj.pk;
             activity['name'] = obj.fields.name;
             return activity;
          });

          var assigned_activities_unformatted = JSON.parse(role_object.activities.assigned);
          var assigned_activities = assigned_activities_unformatted.map(function(obj){
             var activity = {};
             activity['id'] = obj.pk;
             activity['name'] = obj.fields.name;
             return activity;
          });

          this.setState({
            api_response_help: '',
            role_name: role_name,
            available_activities: available_activities,
            assigned_activities: assigned_activities,
            available_users: available_users,
            assigned_users: assigned_users,
          });
        }
      }.bind(this));
    }
    else if(this.props.action == "Add"){
      $.get("/manage-users/api/roles/", function(results) {
        if (this.isMounted()) {

          {/* Objects in results don't have predictable keys */}
          {/* It doesn't matter which one we get */}
          var role_object = {};
          for (var key in results) {
            role_object = results[key];
            break;
          }

          var available_users_unformatted = JSON.parse(role_object.users.available);
          var available_users = available_users_unformatted.map(function(obj){
             var user = {};
             user['id'] = obj.pk;
             user['name'] = obj.fields.email;
             return user;
          });

          var available_activities_unformatted = JSON.parse(role_object.activities.available);
          var available_activities = available_activities_unformatted.map(function(obj){
             var activity = {};
             activity['id'] = obj.pk;
             activity['name'] = obj.fields.name;
             return activity;
          });
          this.setState({
            api_response_help: '',
            available_activities: available_activities,
            available_users: available_users,
          });
        }
      }.bind(this));
    }
  },
  onTextChange: function(event) {
    this.state.role_name = event.target.value;

    {/* I know this is awful. setState overrides some states because they are n-levels deep.
      Look into immutability: http://facebook.github.io/react/docs/update.html */}

    this.setState({
      api_response_help: '',
      role_name: this.state.role_name,
      available_activities: this.refs.activities.state.available_activities,
      assigned_activities: this.refs.activities.state.assigned_activities,
      available_users:  this.refs.users.state.available_users,
      assigned_users:  this.refs.users.state.assigned_users
    })

  },
  handleSaveRoleClick: function (event) {

    {/* Grab form fields and validate */}

    {/* TODO: Warn user? If they remove a user from all roles, they will have to reinvite him. */}

    var role_id = this.props.role_id;

    var assigned_users = this.refs.users.state.assigned_users;

    var role_name = this.state.role_name;
    if(role_name == ""){
      this.setState({
          api_response_help: '',
          role_name_help: 'Role name empty.',
          role_name: this.state.role_name,
          available_activities: this.refs.activities.state.available_activities,
          assigned_activities: this.refs.activities.state.assigned_activities,
          available_users:  this.refs.users.state.available_users,
          assigned_users:  this.refs.users.state.assigned_users
      });
      return;
    }



    var assigned_activities = this.refs.activities.state.assigned_activities;

    console.log("assigned_activities is:");
    console.log(assigned_activities);

    if(assigned_activities.length < 1){
      this.setState({
          api_response_help: '',
          activities_multiselect_help: 'Each role must have at least one activity.',
          role_name: this.state.role_name,
          available_activities: this.refs.activities.state.available_activities,
          assigned_activities: this.refs.activities.state.assigned_activities,
          available_users:  this.refs.users.state.available_users,
          assigned_users:  this.refs.users.state.assigned_users
      });
      return;
    }

    {/* No errors? Clear help text */}

    this.setState({
        api_response_help: '',
        activities_multiselect_help: '',
        role_name: this.state.role_name,
        available_activities: this.refs.activities.state.available_activities,
        assigned_activities: this.refs.activities.state.assigned_activities,
        available_users:  this.refs.users.state.available_users,
        assigned_users:  this.refs.users.state.assigned_users
    });

    {/* Format properly */}

    assigned_activities = assigned_activities.map(function(obj){
       return obj.name;
    });

    assigned_users = assigned_users.map(function(obj){
       return obj.name;
    });

    {/* Determine URL based on action */}
    var url = "";
    if ( this.props.action == "Edit" ){
      url = "/manage-users/api/roles/edit/" + role_id + "/";
    }
    else if ( this.props.action == "Add" ){
      url = "/manage-users/api/roles/create/";
    }

    {/* Build data to send */}
    var data_to_send = {};
    data_to_send['csrfmiddlewaretoken'] = getCsrf();
    data_to_send['role_name'] = role_name;
    data_to_send['assigned_activities'] = assigned_activities;
    data_to_send['assigned_users'] = assigned_users;

    {/* Submit to server */}
    $.post(url, data_to_send, function(response) {
      if ( response.success == "true" ){
        ReactDOM.render(
          <Container page="Roles" reload_apis="true" disappear_text="Role created successfully"/>,
            document.getElementById('content')
        );
      }
      else if ( response.success == "false" ){
        this.setState({
            api_response_help: response.message,
            role_name: this.state.role_name,
            available_activities: this.refs.activities.state.available_activities,
            assigned_activities: this.refs.activities.state.assigned_activities,
            available_users: this.refs.users.state.available_users,
            assigned_users: this.refs.users.state.assigned_users
        });
      }
    }.bind(this));
  },
  handleDeleteRoleClick: function (event) {
    if (confirm('Are you sure you want to delete this role?')) {
    } else {
        return;
    }

    var role_id = this.props.role_id;

    var csrf = getCsrf();

    {/* Submit to server */}

    $.ajax( "/manage-users/api/roles/delete/" + role_id + "/",
      {
        type: "DELETE",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("X-CSRFToken", csrf);
        },
     success: function( response ) {
       ReactDOM.render(
         <Container page="Roles" reload_apis="true"  />,
           document.getElementById('content')
       );
    }});


  },
  render: function() {
    var delete_role_button = "";
    if (this.props.action == "Add") {

    }
    else if (this.props.action == "Edit"){
      delete_role_button = <Button className="pull-right" onClick={this.handleDeleteRoleClick}>Delete Role</Button>
    }

    var role_name_help = this.state.role_name_help;

    var api_response_help = this.state.api_response_help;

    var activities_multiselect_help = this.state.activities_multiselect_help;

    return (
      <div>
        <div className="row">
          <div className="col-xs-12 ">
            <div className="wrapper-header">
              <h2>{this.props.action} Role</h2>
            </div>
            <div className="product-card-full no-highlight">
              <div className="row">
                <div className="col-xs-12">
                  <HelpText message={role_name_help} />
                  <label htmlFor="id_role_name">Role Name*:</label>
                  <input id="id_role_name" maxLength="255" name="name" type="text" value={this.state.role_name} size="35" onChange={this.onTextChange}/>
                </div>
              </div>

              <hr/>

              <HelpText message={activities_multiselect_help} />

              <ActivitiesMultiselect available_activities={this.state.available_activities} assigned_activities={this.state.assigned_activities} ref="activities"/>

              <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>

              <hr/>

              <UsersMultiselect available_users={this.state.available_users} assigned_users={this.state.assigned_users} ref="users"/>

              <span className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</span>

              <hr />

              <div className="row">
                <div className="col-xs-12">
                  <span className="primary pull-right">
                    <HelpText message={api_response_help} />
                  </span>
                </div>

                <div className="col-xs-12">
                  <Button className="primary pull-right" onClick={this.handleSaveRoleClick}>Save Role</Button>
                  {delete_role_button}
                  <CancelRoleButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var RolesPage = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Roles</h2>
          </div>
          <div className="product-card-full no-highlight">

            <RolesList roles_table_rows={this.props.roles_table_rows} />

            <hr/>

            <div className="row">
              <div className="col-xs-12">
                <AddRoleButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var ActivitiesPage = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Activities</h2>
          </div>
          <div className="product-card-full no-highlight">

            <ActivitiesList activities_table_rows={this.props.activities_table_rows} />

          </div>
        </div>
      </div>
    );
  }
});

var OverviewPage = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Overview</h2>
          </div>
          <div className="product-card no-highlight">
            <p>What should go here?</p>
          </div>
        </div>
      </div>
    );
  }
});

var Content = React.createClass({
  handleEditClick: function(id, page) {
    {/* Might be a better way to do this */}
    if (page == "EditRole"){
      var role_id = id;
    }
    else if(page == "EditUser"){
      var user_id = id;
    }
    ReactDOM.render(
      <Container page={page} action="Edit" role_id={role_id} user_id={user_id}/>,
        document.getElementById('content')
    );
  },
  callRolesAPI: function () {
    {/* Get roles once, but reload if needed */}
    $.get("/manage-users/api/roles/", function(results) {
      if (this.isMounted()) {
        var roles_table_rows = [];
        for (var key in results) {
          results[key].activities = JSON.parse(results[key].activities.assigned);
          results[key].users.assigned = JSON.parse(results[key].users.assigned);
          roles_table_rows.push(
            <tr key={results[key].role.id}>
              <td data-title="Role">{results[key].role.name}</td>
              <td data-title="Associated Activities">
                <AssociatedActivitiesList activities={results[key].activities}/>
              </td>
              <td data-title="Associated Users">
                <AssociatedUsersList users={results[key].users.assigned}/>
              </td>
              <td data-title="Edit">
                <Button onClick={this.handleEditClick.bind(this, results[key].role.id, 'EditRole')}>Edit</Button>
              </td>
            </tr>
          );
        }
        this.setState({
          roles_table_rows: roles_table_rows
        });
      }
    }.bind(this));
  },

  callActivitiesAPI: function () {
    {/* Get activities once, and only once */}
    $.get("/manage-users/api/activities/", function(results) {
      var results = JSON.parse(results)
      if (this.isMounted()) {
        var activities_table_rows = [];
        for (var i = 0; i < results.length; i++) {
          activities_table_rows.push(
            <tr key={results[i].pk}>
              <td>{results[i].fields.name}</td>
              <td>{results[i].fields.description}</td>
            </tr>
          );
        }
        this.setState({
          activities_table_rows: activities_table_rows
        });
      }
    }.bind(this));
  },

  callUsersAPI: function () {
    {/* Get users once, but reload if needed */}
    $.get("/manage-users/api/users/", function(results) {
      if (this.isMounted()) {
        var users_table_rows = [];
        for (var key in results) {
          results[key].roles = JSON.parse(results[key].roles);
          users_table_rows.push(
            <tr key={key}>
              <td data-title="User Email">{results[key].email}</td>
              <td data-title="Associated Roles">
                <AssociatedRolesList roles={results[key].roles}/>
              </td>
              <td data-title="Status">
                <Status status={results[key].status}/>
              </td>
              <td data-title="Edit">
                <Button onClick={this.handleEditClick.bind(this, key, 'EditUser')}>Edit</Button>
              </td>
            </tr>
          );
        }
        this.setState({
          users_table_rows: users_table_rows
        });
      }
    }.bind(this));
  },
  getInitialState: function() {
    return {
      roles_table_rows: [],
      activities_table_rows: [],
      users_table_rows: []
    };
  },
  componentWillReceiveProps: function(nextProps) {
    if ( nextProps.reload_apis == "true" ){
      this.callRolesAPI();
      this.callActivitiesAPI();
      this.callUsersAPI();
    }
  },
  componentDidMount: function() {
    this.callActivitiesAPI();
    this.callRolesAPI();
    this.callUsersAPI();
  },
  render: function() {
    var page = this.props.page;
    switch(page) {
        case "Overview":
            page = <OverviewPage disappear_text={this.props.disappear_text}/>;
            break;
        case "Roles":
            page = <RolesPage roles_table_rows={this.state.roles_table_rows} disappear_text={this.props.disappear_text}/>;
            break;
        case "Activities":
            page = <ActivitiesPage activities_table_rows={this.state.activities_table_rows} disappear_text={this.props.disappear_text}/>;
            break;
        case "Users":
            page = <UsersPage users_table_rows={this.state.users_table_rows} disappear_text={this.props.disappear_text}/>;
            break;
        case "EditRole":
            page = <EditRolePage action={this.props.action} role_id={this.props.role_id} disappear_text={this.props.disappear_text}/>;
            break;
        case "EditUser":
            page = <EditUserPage action={this.props.action} user_id={this.props.user_id} disappear_text={this.props.disappear_text}/>;
            break;
    }
    return (
      <div className="col-sm-8 col-xs-12">
        <div className="card-wrapper">
          {page}
        </div>
      </div>
    );
  }
});

var Menu = React.createClass({
  render: function() {
    return (
      <div className="col-sm-4 col-xs-12 pull-right">
        <div className="sidebar">
          <h2 className="top">Navigation</h2>
          <RolesButton />
          <ActivitiesButton />
          <UsersButton />
        </div>
      </div>
    );
  }
});

var Container = React.createClass({
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <h1><a href="/manage" title="Back to Manage Users">DirectEmployers</a></h1>
          </div>
        </div>

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
          <Menu />
          <Content reload_apis={this.props.reload_apis} page={this.props.page} action={this.props.action} role_id={this.props.role_id} user_id={this.props.user_id} disappear_text={this.props.disappear_text}/>
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
});

ReactDOM.render(
  <Container page="Overview" reload_apis="true" action="" role_id="" user_id=""/>,
    document.getElementById('content')
);
