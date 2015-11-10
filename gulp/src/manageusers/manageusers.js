import React from "react";
import ReactDOM from "react-dom";
import {getCsrf} from 'util/cookie';
import Button from 'react-bootstrap/lib/Button';
import FilteredMultiSelect from "react-filtered-multiselect"



// This is the entry point of the application. Bundling begins here.

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
          results[key].activities = JSON.parse(results[key].activities.assigned);
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
              <td>
                <Button onClick={this.handleEditClick.bind(this, results[key].role.id)}>Edit</Button>
              </td>
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

var AddRoleButton = React.createClass({
  handleClick: function(event) {
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

var RolesButton = React.createClass({
  handleClick: function(event) {
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
    {/* TODO Refactor to use basic Actions and the Dispatchers */}
    return {
      help_message: '',
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
            help_message: '',
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
      help_message: this.state.help_message,
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
          help_message: "Role name can not be empty",
          role_name: this.state.role_name,
          available_activities: this.refs.activities.state.available_activities,
          assigned_activities: this.refs.activities.state.assigned_activities,
          available_users:  this.refs.users.state.available_users,
          assigned_users:  this.refs.users.state.assigned_users
      });
      return;
    }

    var assigned_activities = this.refs.activities.state.assigned_activities;
    if(assigned_activities.length < 1){
      this.setState({
          help_message: "Each role must have at least one activity.",
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
        help_message: "",
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
          <Container page="Roles" disappear_text="Role created successfully"/>,
            document.getElementById('content')
        );
      }
      else if ( response.success == "false" ){
        this.setState({
            help_message: response.message,
            role_name: this.state.role_name,
            available_activities: this.refs.activities.state.available_activities,
            assigned_activities: this.refs.activities.state.assigned_activities,
            available_users:  this.refs.users.state.available_users,
            assigned_users:  this.refs.users.state.assigned_users
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
         <Container page="Roles" />,
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
                  <label htmlFor="id_role_name">Role Name*:</label>
                  <input id="id_role_name" maxLength="255" name="name" type="text" value={this.state.role_name} size="35" onChange={this.onTextChange}/>
                </div>
              </div>

              <hr/>

              {/* <p id="role_select_help" className="help-text">To select multiple options on Windows, hold down the Ctrl key. On OS X, hold down the Command key.</p> */}

              <ActivitiesMultiselect available_activities={this.state.available_activities} assigned_activities={this.state.assigned_activities} ref="activities"/>

              <hr/>

              <UsersMultiselect available_users={this.state.available_users} assigned_users={this.state.assigned_users} ref="users"/>

              <hr />

              <div className="row">

                <div className="col-xs-12">
                  <span className="primary pull-right">
                    {this.state.help_message}
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

            <RolesList source="/manage-users/api/roles/" />

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

            <ActivitiesList source="/manage-users/api/activities/" />

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
  render: function() {
    var page = this.props.page;
    switch(page) {
        case "Overview":
            page = <OverviewPage disappear_text={this.props.disappear_text}/>;
            break;
        case "Roles":
            page = <RolesPage disappear_text={this.props.disappear_text}/>;
            break;
        case "Activities":
            page = <ActivitiesPage disappear_text={this.props.disappear_text}/>;
            break;
        case "EditRole":
            page = <EditRolePage action={this.props.action} role_to_edit={this.props.role_to_edit} role_id={this.props.role_id} disappear_text={this.props.disappear_text}/>;
            break;
    }

    return (
      <div className="col-xs-8">
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
      <div className="col-xs-4">
        <div className="sidebar">
          <h2 className="top">Navigation</h2>
          <RolesButton name={this.props.name} company={this.props.company}/>
          <ActivitiesButton />
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
            <h1><a href="/manage-users/" title="Back to Manage Users">DirectEmployers</a></h1>
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
          <Content page={this.props.page} name={this.props.name} company={this.props.company} action={this.props.action} role_to_edit={this.props.role_to_edit} role_id={this.props.role_id} disappear_text={this.props.disappear_text}/>
          <Menu />
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
});

ReactDOM.render(
  <Container page="Overview" name="Daniel" company="DirectEmployers" action="" role_to_edit="" role_id=""/>,
    document.getElementById('content')
);
