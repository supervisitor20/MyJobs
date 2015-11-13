import React from "react";
import ReactDOM from "react-dom";
import {getCsrf} from 'util/cookie';
import Button from 'react-bootstrap/lib/Button';


// This is the entry point of the application. Bundling begins here.

var ControlButtons = React.createClass({
  render: function() {
    return this.props.control_buttons.map(function(button){
      <Button className="primary pull-right" onClick={this.handleClick}>{button}</Button>
    });
    }
});

//var EmailEditButton = React.createClass({
//  handleClick: function(event) {
//    ReactDOM.render(
//      <Container page="EditRole" action="Add"/>,
//        document.getElementById('content')
//    );
//  },
//  render: function() {
//    return (
//      <Button className="primary pull-right" onClick={this.handleClick}>Edit</Button>
//    );
//  }
//});
//
//var EmailDeleteButton = React.createClass({
//  handleClick: function(event) {
//    ReactDOM.render(
//      <Container page="EditRole" action="Add"/>,
//        document.getElementById('content')
//    );
//  },
//  render: function() {
//    return (
//      <Button className="primary pull-right" onClick={this.handleClick}>Delete</Button>
//    );
//  }
//});

var EmailInput = React.createClass({
  render: function(){
    return (
        <input type="text" className="email-input" id={this.props.id} value={this.props.email} />
    )
  },
});

var InboxList = React.createClass({
  handleEditClick: function(role_id) {
    ReactDOM.render(
      <Container page="EditRole" action="Edit" role_id={role_id}/>,
        document.getElementById('content')
    );
  },
  getInitialState: function() {
    return {
      inbox_divs: '',
      control_buttons:["Delete"]
    };
  },
  componentDidMount: function() {
    $.get(this.props.source, function(results) {
      if (this.isMounted()) {
        var inboxes = JSON.parse(results);
        var inbox_divs = inboxes.map(function(inbox){
          return (
              <div className="clearfix">
                <EmailInput id={inbox.pk} email={inbox.fields.email} disabled="disabled" />
                <ControlButtons control_buttons={this.state.control_buttons} />
              </div>
          )
        })
        this.setState({
          inbox_divs: inbox_divs
        });
      }
    }.bind(this));
  },
  render: function() {
    return (
      <div>
        {this.state.inbox_divs}
      </div>
    );
  }
});

var AddInboxButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
      <Container page="EditRole" action="Add"/>,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button className="primary pull-right" onClick={this.handleClick}>Add Inbox</Button>
    );
  }
});

var InboxManagementButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
    	<Container page="InboxManagement" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button onClick={this.handleClick}>Inbox Management</Button>
    );
  }
});

var OverviewButton = React.createClass({
  handleClick: function(event) {
    ReactDOM.render(
    	<Container page="Overview" />,
        document.getElementById('content')
    );
  },
  render: function() {
    return (
      <Button onClick={this.handleClick}>Overview</Button>
    );
  }
});

var bootstrapClasses = {
  filter: 'form-control',
  select: 'form-control',
  button: 'btn btn btn-block btn-default',
  buttonActive: 'btn btn btn-block btn-primary'
}

var InboxManagementPage = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Inbox Management</h2>
          </div>
          <div className="product-card-full no-highlight">

            <InboxList source="/prm/api/nonuseroutreach/inbox/list" />

            <hr/>

            <div className="row">
              <div className="col-xs-12">
                <EmailInput />
                <AddInboxButton />
              </div>
            </div>
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
            <p>Non User Outreach is a module that will help you manage and track positive outreach efforts by your employees</p>
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
        case "InboxManagement":
            page = <InboxManagementPage disappear_text={this.props.disappear_text}/>;
            break;
        //case "Activities":
        //    page = <ActivitiesPage disappear_text={this.props.disappear_text}/>;
        //    break;
        //case "EditRole":
        //    page = <EditRolePage action={this.props.action} role_to_edit={this.props.role_to_edit} role_id={this.props.role_id} disappear_text={this.props.disappear_text}/>;
        //    break;
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
          <OverviewButton />
          <InboxManagementButton />
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
                Non-User Outreach
              </span>
            </div>
          </div>
        </div>

        <div className="row">
          <Content page={this.props.page} action={this.props.action} role_to_edit={this.props.role_to_edit} role_id={this.props.role_id} disappear_text={this.props.disappear_text}/>
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
