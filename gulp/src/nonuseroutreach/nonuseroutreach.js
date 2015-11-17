import React from "react";
import ReactDOM from "react-dom";
import {getCsrf} from 'util/cookie';
import Button from 'react-bootstrap/lib/Button';

// This is the entry point of the application. Bundling begins here.


var ControlButtons = React.createClass({
  handleButtonClick: function(i) {
    this.props.buttonClicked(this.props.buttons[i]);
  },
  render: function() {
    var buttons = this.props.buttons.map(function(button, i){
          return (
              <Button className="primary pull-right" onClick={this.handleButtonClick.bind(this, i)} key={i}>{button}</Button>
          );
      }.bind(this));
    return (
    <span>{buttons}</span>
    );
  }
});

var EmailInput = React.createClass({
  emailChanged: function(){
    this.props.emailFieldChanged(this.refs.email_input.value.trim());
  },
  render: function(){
    return (
        <input type="text" className="email-input" id={this.props.id} value={this.props.email} onChange={this.emailChanged} ref="email_input" />
    )
  },
});

var InboxRow = React.createClass({
  emailFieldChanged: function(value) {
    this.setState({current_email: value});
    if (value != this.state.initial_email) {
      this.setState({buttons: ['Cancel', 'Save']});
    } else {
      this.setState({buttons: ['Delete']});
    }
  },
  buttonClicked: function(button_value) {
    switch(button_value) {
      case "Delete":
        this.deleteEmail();
        break;
      case "Save":
        this.saveEmail();
        break;
      case "Cancel":
        this.cancelChanges();
        break;
    };
  },
  deleteEmail:function() {
    if (confirm("Are you sure you want to delete " + this.state.initial_email + "@my.jobs?")) {
    } else {
      return;
    }
    this.props.handleDelete(this.props.index)

  },
  saveEmail: function() {
    return;
  },
  cancelChanges: function() {
    this.setState({current_email: this.state.initial_email});
    this.setState({buttons: ['Delete']});
  },
  getInitialState: function() {
    return {
      id: this.props.inbox.pk,
      initial_email: this.props.inbox.fields.email,
      current_email: this.props.inbox.fields.email,
      buttons: ['Delete']
    }
  },
  render: function(){
          return (
          <div className="clearfix">
            <EmailInput id={this.state.id} email={this.state.current_email} emailFieldChanged={this.emailFieldChanged} />
            <ControlButtons buttons={this.state.buttons} buttonClicked={this.buttonClicked} />
          </div>
      );
  }
})

var InboxList = React.createClass({
  handleDelete: function(index) {
    this.setState({
      inboxes: this.state.inboxes.filter((_, i) => i !== index)
    });
  },
  getInitialState: function() {
    return {
      inboxes: [],
    };
  },
  componentDidMount: async function() {
    console.log(this.props);
    console.log(this.props.source);
    const results = await $.get(this.props.source);
    //const results = '[{"pk": 28, "model": "mypartners.outreachemailaddress", "fields": {"email": "milton_bradley_edq"}}, {"pk": 29, "model": "mypartners.outreachemailaddress", "fields": {"email": "halia"}}]';
    console.log(results);
    this.setState({
      inboxes: JSON.parse(results),
    });
    console.log("componentDidMount done");
  },
  render: function() {
    const {inboxes} = this.state;
    var spacer = ''
    if (inboxes.length !== 0){
      spacer = <hr  />;
    }
    return (
      <div>
        {inboxes.map((inbox_ob, i) =>
              <InboxRow inbox={inbox_ob} key={inbox_ob.pk} index={i} handleDelete={this.handleDelete} />
        )}
        {spacer}
      </div>
    );
  }
});

var AddInboxButton = React.createClass({
  render: function() {
    return (
      <Button disabled={true}>Add Inbox</Button>
    );
  }
});

var AddInboxForm = React.createClass({
  getInitialState: function(){
    return {add_disabled: true};
  },
  emailFieldChanged: function(value) {
    this.setState({current_email: value});
    if (value.length > 0) {
      this.setState({add_disabled: false})
    } else {
      this.setState({add_disabled: true})
    }
    // TODO: Form validation
    // TODO: enable/disable add button
  },
  submitInbox: function() {
    // TODO: Submit API
  },
  render: function() {
    return (
      <div className="col-xs-12">
        <EmailInput />
        <AddInboxButton add_disabled={this.state.add_disabled} />
      </div>
    );
  },
});

var InboxManagementButton = React.createClass({
  handleClick: function() {
    this.props.changePage("InboxManagement");
  },
  render: function() {
    return (
      <Button onClick={this.handleClick}>Inbox Management</Button>
    );
  }
});

var OverviewButton = React.createClass({
  handleClick: function(event) {
    this.props.changePage("Overview");
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

            <div className="row">
            <AddInboxForm />
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
            page = <OverviewPage />;
            break;
        case "InboxManagement":
            page = <InboxManagementPage />;
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
          <OverviewButton {...this.props} />
          <InboxManagementButton {...this.props} />
          <AddInboxButton {...this.props} />
        </div>
      </div>
    );
  }
});

var Container = React.createClass({
  getInitialState: function() {
    return {
      page:"Overview",
      company: "DirectEmployers",
    };
  },
  changePage: function(page_input) {
    this.setState({page:page_input})
  },

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
          <Content page={this.state.page} />
          <Menu changePage={this.changePage} />
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
});

ReactDOM.render(
  <Container />,
    document.getElementById('content')
);
