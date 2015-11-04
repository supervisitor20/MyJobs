import React from "react";
import ReactDOM from "react-dom";

import Button from 'react-bootstrap/lib/Button';
import FilteredMultiSelect from "react-filtered-multiselect"

// This is the entry point of the application. Bundling begins here.


var AssociatedUsersList = React.createClass({
  getInitialState: function() {
    return {
      associated_users_list: ''
    };
  },
  componentDidMount: function() {
    if (this.isMounted()) {
      var associated_users_list = [];
      for (var key in this.props.users) {
        associated_users_list.push(
          <li key={key}>
              {this.props.users[key].fields.email}
          </li>
        );
      };
      this.setState({
        associated_users_list: associated_users_list
      });
    }
  },
  render: function() {
    return (
      <ul>
        {this.state.associated_users_list}
      </ul>
    );
  }
});

var AssociatedActivitiesList = React.createClass({
  getInitialState: function() {
    return {
      associated_activities_list: ''
    };
  },
  componentDidMount: function() {
    if (this.isMounted()) {
      var associated_activities_list = [];
      for (var key in this.props.activities) {
        associated_activities_list.push(
          <li key={this.props.activities[key].pk}>
            {this.props.activities[key].fields.name}
          </li>
        );
      };
      this.setState({
        associated_activities_list: associated_activities_list
      });
    }
  },
  render: function() {
    return (
      <ul>
        {this.state.associated_activities_list}
      </ul>
    );
  }
});

var RolesList = React.createClass({
  handleEditClick: function(role_id) {
    console.info("User clicked edit role link for this role: " + role_id);

    ReactDOM.render(
      <Container page="EditRole" name={this.props.name} company={this.props.company} action="Edit" role_id={role_id}/>,
        document.getElementById('content')
    );
  },
  getInitialState: function() {
    return {
      table_rows: ''
    };
  },
  componentDidMount: function() {
    $.get(this.props.source, function(results) {

      if (this.isMounted()) {
        var table_rows = [];
        for (var key in results) {
          results[key].activities = JSON.parse(results[key].activities);
          results[key].users.assigned = JSON.parse(results[key].users.assigned);

          table_rows.push(
            <tr key={results[key].role.id}>
              <td>{results[key].role.name}</td>
              <td>
                <AssociatedActivitiesList activities={results[key].activities}/>
              </td>
              <td>
                <AssociatedUsersList users={results[key].users.assigned}/>
              </td>
              <td><a onClick={this.handleEditClick.bind(this, results[key].role.id)}>Edit</a></td>
            </tr>
          );
        }
        this.setState({
          table_rows: table_rows
        });
      }

    }.bind(this));
  },
  render: function() {
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Associated Activities</th>
              <th>Associated Users</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.table_rows}
          </tbody>
        </table>
      </div>
    );
  }
});

var ActivitiesList = React.createClass({
  getInitialState: function() {
    return {
      table_rows: ''
    };
  },
  componentDidMount: function() {
    $.get(this.props.source, function(results) {
      var results = JSON.parse(results)
      if (this.isMounted()) {
        var table_rows = [];
        for (var i = 0; i < results.length; i++) {
          table_rows.push(
            <tr key={results[i].pk}>
              <td>{results[i].fields.name}</td>
              <td>{results[i].fields.description}</td>
            </tr>
          );
        }
        this.setState({
          table_rows: table_rows
        });
      }
    }.bind(this));
  },
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
            {this.state.table_rows}
          </tbody>
        </table>
      </div>
    );
  }
});

var CancelRoleButton = React.createClass({
  handleClick: function(event) {
    console.info("User clicked CancelRoleButton");

    ReactDOM.render(
      <Container page="Roles" name={this.props.name} company={this.props.company}/>,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="pull-right" onClick={this.handleClick}>Cancel</Button>
    );
  }
});

var DeleteRoleButton = React.createClass({
  handleClick: function(event) {
    console.info("User clicked DeleteRoleButton");

    {/* TODO: Actually delete role
        TODO: Warn with a modal, are you sure you want to delete role? */}

    ReactDOM.render(
      <Container page="Roles" name={this.props.name} company={this.props.company}/>,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="pull-right" onClick={this.handleClick}>Delete Role</Button>
    );
  }
});

var SaveRoleButton = React.createClass({
  handleClick: function(event) {
    console.info("User clicked SaveRoleButton");

    {/* TODO: Grab role_name */}


    {/* TODO: Grab assigned_activities */}

    {/* " use refs to get the value when I submit.
      https://facebook.github.io/react/docs/forms.html
      https://facebook.github.io/react/docs/working-with-the-browser.html
      "*/}

    {/* TODO: Require at least one activity be selected */}

    {/* TODO: Grab assigned_users */}



    {/* TODO: Format properly */}

    {/* TODO: Submit to server */}


  },
  render: function() {
    return (
      <Button className="primary pull-right" onClick={this.handleClick}>Save Role</Button>
    );
  }
});

var AddRoleButton = React.createClass({
  handleClick: function(event) {
    console.info("User clicked AddRoleButton");

    ReactDOM.render(
      <Container page="EditRole" name={this.props.name} company={this.props.company} action="Add"/>,
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
    console.info("User clicked CancelUserButton");

    ReactDOM.render(
      <Container page="Users" name={this.props.name} company={this.props.company}/>,
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
    console.info("User clicked DeleteUserButton");

    {/* TODO: Actually delete user
        TODO: Warn with a modal, are you sure you want to delete user? */}

    ReactDOM.render(
      <Container page="Users" name={this.props.name} company={this.props.company}/>,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="pull-right" onClick={this.handleClick}>Delete Users</Button>
    );
  }
});

var SaveUserButton = React.createClass({
  handleClick: function(event) {
    console.info("User clicked SaveUserButton");
    {/* TODO A user MUST be assigned to at least one role
        TODO Submit new user to server */}
  },
  render: function() {
    return (
      <Button className="primary pull-right" onClick={this.handleClick}>Save Users</Button>
    );
  }
});

var AddUserButton = React.createClass({
  handleClick: function(event) {
    console.info("User clicked AddUserButton");

    ReactDOM.render(
    	<Container page="EditUser" name={this.props.name} company={this.props.company} action="Add" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="primary pull-right"  onClick={this.handleClick}>Add Users</Button>
    );
  }
});

var RolesButton = React.createClass({
  handleClick: function(event) {
    console.info("User clicked RolesButton");

    ReactDOM.render(
    	<Container page="Roles" name={this.props.name} company={this.props.company}/>,
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
    console.info("User clicked ActivitiesButton");

    ReactDOM.render(
    	<Container page="Activities" name={this.props.name} company={this.props.company}/>,
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
    console.info("User clicked UsersButton");

    ReactDOM.render(
    	<Container page="Users" name={this.props.name} company={this.props.company}/>,
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

var UserEmailAddressTextField = React.createClass({
  render: function() {
    if (this.props.action == "Add"){
      return (
        <input id="id_user_name" maxLength="255" name="id_user_name" editable type="email" size="35"/>
      );
    }
    else if (this.props.action == "Edit"){
      return (
        <input id="id_user_name" maxLength="255" name="id_user_name" type="email" readOnly value={this.props.user_to_edit} size="35"/>
      );
    }
  }
});

var EditUserPage = React.createClass({
  render: function() {
    var user_invitation_email_form = "";
    var delete_user_button = "";
    if (this.props.action == "Add") {
      user_invitation_email_form = <UserInvitationEmailForm />;

    }
    else if (this.props.action == "Edit"){
      delete_user_button = <DeleteUserButton action={this.props.action} user_to_edit={this.props.user_to_edit}/>;
    }

    {/* Needed because, apparently, no way to make height of multiselect variable to fill contents */}
    {/* TODO: Update value dynamically */}
    var roles_count = 4;

    {/* Needed because, both EditUserPage and EditRolePage components can handle editing or adding,
      depending on value of this.props.action (e.g. Edit, Add)
      Roles can always be editted, but we don't want emails to be editted. */}
    var user_email_text_field = <UserEmailAddressTextField action={this.props.action} user_to_edit={this.props.user_to_edit}/>;

    return (
      <div>

        <div className="row">
          <div className="col-xs-12">
            <h2>{this.props.action} User</h2>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-xs-10">
            <label htmlFor="id_user_name">User Email Address*:</label>
            <div className="input-group">
              {user_email_text_field}
            </div>
          </div>
        </div>

        <hr/>

        <div className="row">
          <div className="col-xs-12">
            {/* TODO Maybe use this https://github.com/insin/react-filtered-multiselect */}

            <label htmlFor="id_roles">Role*:</label>

            <select name="id_roles" size={roles_count} multiple defaultValue={['Analytics Setup', 'Analytics User']} aria-describedby="role_select_help">
              <option value="Analytics Setup">Analytics Setup</option>
              <option value="Analytics User">Analytics User</option>
              <option value="PRM - Read">PRM - Read</option>
              <option value="PRM - Full Access">PRM - Full Access</option>
            </select>
            <p id="role_select_help" className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</p>
          </div>
        </div>

        <hr/>

        {user_invitation_email_form}

        <div className="row">
          <div className="col-xs-12">
            <SaveUserButton />
            {delete_user_button}
            <CancelUserButton />
          </div>
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

    console.log("inside ActivitiesMultiselect initial state");
    console.log(this.props.available_activities);


    return {
      available_activities: this.props.available_activities,
      assigned_activities: this.props.assigned_activities,
    }
  },
  componentWillReceiveProps: function(nextProps) {

    console.log("inside ActivitiesMultiselect initial state");
    console.log(nextProps.available_activities);


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
            <label>Available Activities:</label>
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
            <label>Activities Assigned to this Role:</label>
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

    console.log("Inside UsersMultiselect initial state");
    console.log(this.props);

    return {
      assigned_users: this.props.assigned_users,
      available_users: this.props.available_users,
    }
  },
  componentWillReceiveProps: function(nextProps) {

    console.log("Inside UsersMultiselect componentWillReceiveProps");
    console.log(this.props.available_users);

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
            <label>Available Users:</label>
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
            <label>Users Assigned to this Role:</label>
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

    return {
      role_name: '',
      available_activities: [],
      assigned_activities: [],
      available_users: [],
      assigned_users: [],
    };
  },
  componentDidMount: function() {
    $.get("/manage-users/api/roles/" + this.props.role_id, function(results) {
      if (this.isMounted()) {

        var role_object = results[this.props.role_id];
        var assigned_users_unformatted = JSON.parse(role_object.users.assigned);
        var assigned_users = [];
        for (var i = 0; i < assigned_users_unformatted.length; i++) {
          var user = {}
          user['id'] = assigned_users_unformatted[i].pk;
          user['name'] = assigned_users_unformatted[i].fields.email;
          assigned_users.push(user);
        }

        {/*
        var available_users_unformatted = JSON.parse(role_object.users.available);
        var available_users = [];
        for (var i = 0; i < available_users_unformatted.length; i++) {
          var user = {}
          user['id'] = available_users_unformatted[i].pk;
          user['name'] = available_users_unformatted[i].fields.email;
          available_users.push(user);
        }

        */}

        var available_users = [
          {id: 1, name: "dpoynter@apps.directemployers.org"},
          {id: 2, name: "bob@apps.directemployers.org"},
        ];

        var role_name = role_object.role.name;
        {/* TODO Fix API to return available activities (right now it's just assigned activities) */}
        var assigned_activities = [{id: 1, name: "Access Analytics"},{id: 2, name: "Edit Analytics Settings"},]

        var available_activities = [
          {id: 1, name: "Access Analytics"},
          {id: 2, name: "Edit Analytics Settings"},
          {id: 3, name: "Activate Analytics Settings"},
          {id: 4, name: "Delete Analytics"},
          {id: 5, name: "Read PRM Settings"},
          {id: 6, name: "Read PRM Reports"},
          {id: 7, name: "Edit PRM Settings"},
          {id: 8, name: "Activate PRM Settings"},
          {id: 9, name: "Delete PRM"}
        ];

        this.setState({
          role_name: role_name,
          available_activities: available_activities,
          assigned_activities: assigned_activities,
          available_users: available_users,
          assigned_users: assigned_users,
        });
      }
    }.bind(this));
  },

  onTextChange: function (event) {
    this.state.role_name = event.target.value;
    this.setState({role_name: this.state.role_name});
  },

  render: function() {
    var delete_role_button = "";
    if (this.props.action == "Add") {

    }
    else if (this.props.action == "Edit"){
      delete_role_button = <DeleteRoleButton action={this.props.action} role_to_edit={this.props.role_to_edit}/>;
    }

    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h2>{this.props.action} Role</h2>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-xs-12">
            <label htmlFor="id_role_name">Role Name*:</label>
            <input id="id_role_name" maxLength="255" name="name" type="text" value={this.state.role_name} size="35" onChange={this.onTextChange}/>
          </div>
        </div>

        <hr/>

        <ActivitiesMultiselect available_activities={this.state.available_activities} assigned_activities={this.state.assigned_activities}/>

        <hr/>

        <UsersMultiselect available_users={this.state.available_users} assigned_users={this.state.assigned_users}/>

        <hr />

        <div className="row">
          <div className="col-xs-12">
            <SaveRoleButton />
            {delete_role_button}
            <CancelRoleButton />
          </div>
        </div>
      </div>
    );
  }
});

var RolesPage = React.createClass({
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h2>Roles</h2>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-xs-12">
            <RolesList source="/manage-users/api/roles/" />
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-xs-12">
            <AddRoleButton />
          </div>
        </div>
      </div>
    );
  }
});


var ActivitiesPage = React.createClass({
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h2>Activities</h2>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-xs-12">

            <ActivitiesList source="/manage-users/api/activities/" />

          </div>
        </div>


      </div>
    );
  }
});

var UsersPage = React.createClass({
  handleEditClick: function(user_to_edit) {
    console.info("User clicked edit user link for this user: " + user_to_edit);

    ReactDOM.render(
      <Container page="EditUser" name={this.props.name} company={this.props.company} action="Edit" user_to_edit={user_to_edit}/>,
        document.getElementById('content')
    );

  },
  render: function() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h2>Users</h2>
          </div>
        </div>

        <hr />

        {/* TODO: Use a Component like this: https://github.com/facebook/fixed-data-table */}
        <div className="row">
          <div className="col-xs-12">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Associated Roles</th>
                  <th>Status</th>
                  <th className="col-md-1"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>david@apps.directemployers.org</td>
                  <td>
                    <ul>
                      <li>PRM - Read</li>
                      <li>PRM - Full Access</li>
                      <li>Analytics Setup</li>
                      <li>Analytics User</li>
                    </ul>
                  </td>
                  <td><span className="label label-warning">Pending</span></td>
                  <td><a onClick={this.handleEditClick.bind(this, "david@apps.directemployers.org")}>Edit</a></td>
                </tr>
                <tr>
                  <td>dpoynter@apps.directemployers.org</td>
                  <td>
                    <ul>
                      <li>PRM - Read</li>
                    </ul>
                  </td>
                  <td><span className="label label-success">Active</span></td>
                  <td><a onClick={this.handleEditClick.bind(this, "dpoynter@apps.directemployers.org")}>Edit</a></td>
                </tr>
                <tr>
                  <td>edwin@apps.directemployers.org</td>
                  <td>
                    <ul>
                      <li>Analytics Setup</li>
                    </ul>
                  </td>
                  <td><span className="label label-success">Active</span></td>
                  <td><a onClick={this.handleEditClick.bind(this, "edwin@apps.directemployers.org")}>Edit</a></td>
                </tr>
                <tr>
                  <td>jkoons@apps.directemployers.org</td>
                  <td>
                    <ul>
                      <li>PRM - Read</li>
                      <li>PRM - Full Access</li>
                    </ul>
                  </td>
                  <td><span className="label label-success">Active</span></td>
                  <td><a onClick={this.handleEditClick.bind(this, "jkoons@apps.directemployers.org")}>Edit</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr/>

        <div className="row">
          <div className="col-xs-12">
            <AddUserButton />
          </div>
        </div>
      </div>
    );
  }
});






var OverviewPage = React.createClass({
  render: function() {

    return (
      <div>
        <div className="row">
          <div className="col-xs-12">
            <h2>Overview</h2>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-xs-4">

            {/* <p>{this.props.name} works with {this.props.company}.</p> */}

            {/* TODO: Use a Component like this: https://github.com/facebook/fixed-data-table */}

            <table className="table">
              <tbody>
                <tr>
                  <td><strong>Roles:</strong></td>
                  <td>4</td>
                  <td></td>
                </tr>
                <tr>
                  <td><strong>Users:</strong></td>
                  <td>4</td>
                </tr>
                <tr>
                  <td>Pending</td>
                  <td>
                    <span className="label label-warning">1</span>
                  </td>
                </tr>
                <tr>
                  <td>Active</td>
                  <td>
                    <span className="label label-success">3</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
});

var Content = React.createClass({
  render: function() {
    var page = this.props.page;
    switch(page) {
        case "Overview":
            page = <OverviewPage name={this.props.name} company={this.props.company}/>;
            break;
        case "Roles":
            page = <RolesPage name={this.props.name} company={this.props.company}/>;
            break;
        case "Activities":
            page = <ActivitiesPage name={this.props.name} company={this.props.company}/>;
            break;
        case "Users":
            page = <UsersPage name={this.props.name} company={this.props.company}/>;
            break;
        case "EditRole":
            page = <EditRolePage name={this.props.name} company={this.props.company}  action={this.props.action} role_to_edit={this.props.role_to_edit} role_id={this.props.role_id}/>;
            break;
        case "EditUser":
            page = <EditUserPage name={this.props.name} company={this.props.company} action={this.props.action} user_to_edit={this.props.user_to_edit}/>;
            break;
    }

    return (
      <div className="col-sm-8">
        <div className="panel">
          {page}
        </div>
      </div>
    );
  }
});

var Menu = React.createClass({
  render: function() {
    return (
      <div className="col-sm-4">
        <div className="sidebar">
          <h2 className="top">Manage</h2>
          <RolesButton name={this.props.name} company={this.props.company}/>
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
              Manage Users
            </div>
          </div>
        </div>

        <div className="row">
          <Content page={this.props.page} name={this.props.name} company={this.props.company} action={this.props.action} role_to_edit={this.props.role_to_edit} role_id={this.props.role_id} user_to_edit={this.props.user_to_edit}/>
          <Menu />
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
});


ReactDOM.render(
  <Container page="Overview" name="Daniel" company="DirectEmployers" action="" role_to_edit="" role_id="" user_to_edit=""/>,
    document.getElementById('content')
);
