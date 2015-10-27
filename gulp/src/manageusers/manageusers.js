import React from "react";
import ReactDOM from "react-dom";

import Button from 'react-bootstrap/lib/Button';
import FilteredMultiSelect from "react-filtered-multiselect"

// This is the entry point of the application. Bundling begins here.

var CancelRoleButton = React.createClass({
  handleClick: function(event) {
    console.log("User clicked CancelRoleButton");

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
    console.log("User clicked DeleteRoleButton");

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
    console.log("User clicked SaveRoleButton");

    {/* TODO Make sure at least one role is selected
        TODO Submit to server  */}

  },
  render: function() {
    return (
      <Button className="primary pull-right" onClick={this.handleClick}>Save Role</Button>
    );
  }
});

var AddRoleButton = React.createClass({
  handleClick: function(event) {
    console.log("User clicked AddRoleButton");

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
    console.log("User clicked CancelUserButton");

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
    console.log("User clicked DeleteUserButton");

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
    console.log("User clicked SaveUserButton");
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
    console.log("User clicked AddUserButton");

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
    console.log("User clicked RolesButton");

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
    console.log("User clicked ActivitiesButton");

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
    console.log("User clicked UsersButton");

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

var AVAILABLE_ACTIVITIES = [
  {id: 1, name: "Access Analytics"},
  {id: 2, name: "Edit Analytics Settings"},
  {id: 3, name: "Activate Analytics Settings"},
  {id: 4, name: "Delete Analytics"},
  {id: 5, name: "Read PRM Settings"},
  {id: 6, name: "Read PRM Reports"},
  {id: 7, name: "Edit PRM Settings"},
  {id: 8, name: "Activate PRM Settings"},
  {id: 9, name: "Delete PRM"}
]

var ActivitiesMultiselect = React.createClass({
  getInitialState() {
    return {
      selectedOptions: []
    }
  },
  _onSelect(selectedOptions) {
    selectedOptions.sort((a, b) => a.id - b.id)
    this.setState({selectedOptions})
  },
  _onDeselect(deselectedOptions) {
    var selectedOptions = this.state.selectedOptions.slice()
    deselectedOptions.forEach(option => {
      selectedOptions.splice(selectedOptions.indexOf(option), 1)
    })
    this.setState({selectedOptions})
  },
  render: function() {
    var {selectedOptions} = this.state

    return (
        <div className="row">

          <div className="col-xs-6">
            <label>Available Activities:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={AVAILABLE_ACTIVITIES}
              selectedOptions={selectedOptions}
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
              options={selectedOptions}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  }
});

var AVAILABLE_USERS = [
  {id: 1, name: "david@apps.directemployers.org"},
  {id: 2, name: "dpoynter@apps.directemployers.org"},
  {id: 3, name: "edwin@apps.directemployers.org"},
  {id: 4, name: "jkoons@apps.directemployers.org"},
]

var UsersMultiselect = React.createClass({
  getInitialState() {
    return {
      selectedOptions: []
    }
  },
  _onSelect(selectedOptions) {
    selectedOptions.sort((a, b) => a.id - b.id)
    this.setState({selectedOptions})
  },
  _onDeselect(deselectedOptions) {
    var selectedOptions = this.state.selectedOptions.slice()
    deselectedOptions.forEach(option => {
      selectedOptions.splice(selectedOptions.indexOf(option), 1)
    })
    this.setState({selectedOptions})
  },
  render: function() {
    var {selectedOptions} = this.state

    return (
        <div className="row">

          <div className="col-xs-6">
            <label>Available Activities:</label>
            <FilteredMultiSelect
              buttonText="Add"
              classNames={bootstrapClasses}
              onChange={this._onSelect}
              options={AVAILABLE_USERS}
              selectedOptions={selectedOptions}
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
              options={selectedOptions}
              textProp="name"
              valueProp="id"
            />
          </div>
        </div>
    );
  }
});

var EditRolePage = React.createClass({
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
            <input id="id_role_name" maxLength="255" name="name" type="text" defaultValue={this.props.role_to_edit} size="35"/>
          </div>
        </div>

        <hr/>

        <ActivitiesMultiselect/>

        <hr/>

        <UsersMultiselect/>

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
  handleEditClick: function(role_to_edit) {
    console.log("User clicked edit role link for this role: " + role_to_edit);

    ReactDOM.render(
      <Container page="EditRole" name={this.props.name} company={this.props.company} action="Edit" role_to_edit={role_to_edit}/>,
        document.getElementById('content')
    );

  },
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
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Associated Activities</th>
                  <th>Associated Users</th>
                  <th className="col-md-1"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Analytics Setup</td>
                  <td>
                    <ul>
                      <li>Access Analytics</li>
                      <li>Edit Analytics Settings</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>david@apps.directemployers.org</li>
                      <li>edwin@apps.directemployers.org</li>
                    </ul>
                  </td>
                  <td><a onClick={this.handleEditClick.bind(this, "Analytics Setup")}>Edit</a></td>
                </tr>
                <tr>
                  <td>Analytics User</td>
                  <td>
                    <ul>
                      <li>Access Analytics</li>
                      <li>Edit Analytics Settings</li>
                      <li>Activate Analytics Settings</li>
                      <li>Delete Analytics</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>david@apps.directemployers.org</li>
                    </ul>
                  </td>
                  <td><a onClick={this.handleEditClick.bind(this, "Analytics User")}>Edit</a></td>
                </tr>
                <tr>
                  <td>PRM - Full Access</td>
                  <td>
                    <ul>
                      <li>Edit PRM Settings</li>
                      <li>Activate PRM Settings</li>
                      <li>Delete PRM</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>david@apps.directemployers.org</li>
                      <li>jkoons@apps.directemployers.org</li>
                    </ul>
                  </td>
                  <td><a onClick={this.handleEditClick.bind(this, "PRM - Full Access")}>Edit</a></td>
                </tr>
                <tr>
                  <td>PRM - Read</td>
                  <td>
                    <ul>
                      <li>Read PRM Settings</li>
                      <li>Read PRM Reports</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>david@apps.directemployers.org</li>
                      <li>dpoynter@apps.directemployers.org</li>
                      <li>jkoons@apps.directemployers.org</li>
                    </ul>
                  </td>
                  <td><a onClick={this.handleEditClick.bind(this, "PRM - Read")}>Edit</a></td>
                </tr>
              </tbody>
            </table>
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
          {/*TODO Pull in Activities and Activity Descriptions dynamically */}
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Access Analytics</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
                <tr>
                  <td>Edit Analytics Settings</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
                <tr>
                  <td>Activate Analytics Settings</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
                <tr>
                  <td>Delete Analytics</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
                <tr>
                  <td>Read PRM Settings</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
                <tr>
                  <td>Read PRM Reports</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
                <tr>
                  <td>Edit PRM Settings</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
                <tr>
                  <td>Activate PRM Settings</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
                <tr>
                  <td>Delete PRM</td>
                  <td>Ideally, activity names will be self-explanatory. If not, a further description could be useful.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>


      </div>
    );
  }
});

var UsersPage = React.createClass({
  handleEditClick: function(user_to_edit) {
    console.log("User clicked edit user link for this user: " + user_to_edit);

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
            page = <EditRolePage name={this.props.name} company={this.props.company}  action={this.props.action} role_to_edit={this.props.role_to_edit}/>;
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

    if(this.props.name && this.props.company){
      console.log("Welcome. User information passed to ReactJS:");
      console.log(this.props.name);
      console.log(this.props.company);
    }

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
          <Content page={this.props.page} name={this.props.name} company={this.props.company} action={this.props.action} role_to_edit={this.props.role_to_edit} user_to_edit={this.props.user_to_edit}/>
          <Menu />
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
});


ReactDOM.render(
  <Container page="Overview" name="Daniel" company="DirectEmployers" action="" role_to_edit="" user_to_edit=""/>,
    document.getElementById('content')
);
