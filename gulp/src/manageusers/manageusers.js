import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, Link } from 'react-router'
import {getCsrf} from 'util/cookie';
import {validateEmail} from 'util/validateEmail';
import Button from 'react-bootstrap/lib/Button';
import FilteredMultiSelect from "react-filtered-multiselect"


const App = React.createClass({
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
               {/* <Link to={`/role/${results[key].role.id}` action=`Edit`}>Edit</Link> */}

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





  getInitialState: function() {
    return {
      roles_table_rows: [],
      activities_table_rows: [],
      users_table_rows: []
    };
  },
  componentWillReceiveProps: function(nextProps) {
    if ( nextProps.reload_apis == "true" ){
      this.callActivitiesAPI();
      this.callRolesAPI();
      {/*
      this.callUsersAPI(); */}
    }
  },
  componentDidMount: function() {
    this.callActivitiesAPI();
    this.callRolesAPI();
    {/*
    this.callUsersAPI(); */}
  },
  render() {
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
                <Link to="/">Manage Users</Link>
              </span>
            </div>
          </div>
        </div>

        <div className="row">

          <div className="col-sm-8 col-xs-12">
            <div className="card-wrapper">

              {this.props.children && React.cloneElement(

                this.props.children, {
                  activities_table_rows: this.state.activities_table_rows,
                  roles_table_rows: this.state.roles_table_rows,
                  action: "Edit"
                })

              }

            </div>
          </div>

          <div className="col-sm-4 col-xs-12 pull-right">
            <div className="sidebar">
              <h2 className="top">Navigation</h2>
              {/* <RolesButton /> */}
              <Link to="/roles">Roles</Link>
              <Link to="/activities">Activities</Link>
              {/* <UsersButton /> */}
            </div>
          </div>


          {/*

          <Content reload_apis={this.props.route.reload_apis} page={this.props.route.page} action={this.props.route.action} role_id={this.props.route.role_id} user_id={this.props.route.user_id} disappear_text={this.props.route.disappear_text}/>
          */}

        </div>
        <div className="clearfix"></div>

        {/*
        <div>
          <h1>App</h1>
          <ul>
            <li><Link to="/activities">Activities</Link></li>
          </ul>
          {this.props.children}
        </div>
        */}


      </div>



    )
  }
})





const Overview = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Overview</h2>
          </div>
          <div className="product-card no-highlight">
            <p>Use this tool to create users and permit them to perform various activities.</p>
            <p>First, create a role. A role is a group of activities (e.g. view existing communication records, add new communication records, etc.). Then, create a user and assign them to that role. Once assigned to a role, that user can execute activities assigned to that role.</p>
          </div>
        </div>
      </div>
    );
  }
});














const RolesList = React.createClass({
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







const ActivitiesList = React.createClass({
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




const Activities = React.createClass({

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





const AssociatedActivitiesList = React.createClass({
  render: function() {
    var associated_activities_list = this.props.activities.map(function(activity, index) {
      return (
        <li key={index}>
          {activity.fields.name}
        </li>
      );
    });
    return (
      <ul>
        {associated_activities_list}
      </ul>
    );
  }
});


const AssociatedUsersList = React.createClass({
  render: function() {
    var associated_users_list = this.props.users.map(function(user, index) {
      return (
        <li key={index}>
          {user.fields.email}
        </li>
      );
    });
    return (
      <ul>
        {associated_users_list}
      </ul>
    );
  }
});


const AddRoleButton = React.createClass({
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



const bootstrapClasses = {
  filter: 'form-control',
  select: 'form-control',
  button: 'btn btn btn-block btn-default',
  buttonActive: 'btn btn btn-block btn-primary'
}

const ActivitiesMultiselect = React.createClass({
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


const CancelRoleButton = React.createClass({
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


const UsersMultiselect = React.createClass({
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




const Roles = React.createClass({
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
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});




const Role = React.createClass({
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

      $.get("/manage-users/api/roles/" + this.props.params.role_id, function(results) {
        if (this.isMounted()) {

          var role_object = results[this.props.params.role_id];

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

    var role_id = this.props.params.role_id;

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
      {/* TODO: Render a nice disappearing alert with the disappear_text prop. Use the React CSSTransitionGroup addon.
        http://stackoverflow.com/questions/33778675/react-make-flash-message-disappear-automatically
        */}
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
    }.bind(this))
    .fail( function(xhr) {
      if(xhr.status == 403){
        this.setState({
            api_response_help: "Unable to save role. Insufficient privileges.",
        });
      }
    }.bind(this));
  },
  handleDeleteRoleClick: function (event) {
    if (confirm('Are you sure you want to delete this role?')) {
    } else {
        return;
    }

    var role_id = this.props.params.role_id;

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
    }})
    .fail( function(xhr) {
      if(xhr.status == 403){
        this.setState({
            api_response_help: "Role not deleted. Insufficient privileges.",
        });
      }
    }.bind(this));
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






const Users = React.createClass({
  render() {
    return (
      <div>
        <h1>Users</h1>
        <div className="master">
          list of users
        </div>
        <div className="detail">
          {this.props.children}
        </div>
      </div>
    )
  }
})

const User = React.createClass({
  render() {
    return (
      <div>
        <h2>{this.props.params.userId}</h2>

      </div>
    )
  }
})



render((
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Overview} />
      <Route path="activities" component={Activities} />
      <Route path="roles" component={Roles} />
      <Route path="/role/:role_id" component={Role}/>
      <Route path="users" component={Users}>
        <Route path="/user/:userId" component={User}/>
      </Route>
    </Route>
  </Router>
), document.getElementById('content'))
