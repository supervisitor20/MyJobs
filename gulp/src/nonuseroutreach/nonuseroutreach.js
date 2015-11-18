import React from "react";
import ReactDOM from "react-dom";
import {getCsrf} from 'util/cookie';
import Button from 'react-bootstrap/lib/Button';

// class to contain dynamic email editing states, type is text of button and function identifier, disabled is whether
// the button is disabled or not. by default, it is not disabled
class ControlButton {
  constructor(type, disabled=false) {
    this.type = type;
    this.disabled = disabled;
  }
}

// Display errors from client-side form validation.. red text above stuff
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

// validation method to ensure value is a proper email username
// returns:
// Object
//    -success (whether or not the object validated)
//    -message (error message from validator)
var validateEmailInput = function(value){
  var return_object = {
    success: true,
    messages: []
  }
  var email_re = new RegExp("^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*$", "i");
  var at_re = new RegExp("@+");
  if (value.length == 0) {
    return_object.success = false;
    return return_object;
    };
  if (at_re.test(value)) {
    return_object.success = false;
    return_object.messages.push("Enter only the portion to the left of the '@'")
  } else if (!email_re.test(value)) {
    return_object.success = false;
    return_object.messages.push("Please enter a valid email username")
  };
  return return_object;
};


// creates span with buttons for saving, deleting, and canceling changes to an existing inbox
var ControlButtons = React.createClass({
  handleButtonClick: function(i) {
    this.props.buttonClicked(this.props.buttons[i]);
  },
  render: function() {
    var buttons = this.props.buttons.map(function(button, i){
          return (
              <Button disabled={button.disabled} className="primary pull-right" onClick={this.handleButtonClick.bind(this, i)} key={i}>{button.type}</Button>
          );
      }.bind(this));
    return (
    <span>{buttons}</span>
    );
  }
});


// textbox for entering email usernames. used in both add and edit functionalities
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


// individual inbox loaded from DB, contains inbox textbox and control buttons
var InboxRow = React.createClass({
  emailFieldChanged: function(value) {
    var validation_object = validateEmailInput(value);
    this.setState({
      current_email: value,
      validation_messages: validation_object.messages
    })
    if (value != this.state.initial_email) {
      this.setState({buttons: [new ControlButton("Cancel"), new ControlButton("Save", !validation_object.success)]});
    } else {
      this.setState({buttons: [new ControlButton("Delete")]});
    }
  },
  buttonClicked: function(button) {
    switch(button.type) {
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
    this.setState({
      current_email: this.state.initial_email,
      buttons: [new ControlButton("Delete")],
      validation_messages: [],
    });
  },
  getInitialState: function() {
    return {
      id: this.props.inbox.pk,
      initial_email: this.props.inbox.fields.email,
      current_email: this.props.inbox.fields.email,
      buttons: [new ControlButton("Delete")],
      validation_messages: []
    }
  },
  render: function(){
    var validation_messages = this.state.validation_messages.map((message) =>
    <HelpText message={message} />
    );
    return (
    <div className="clearfix inbox-row">
      {validation_messages}
      <EmailInput id={this.state.id} email={this.state.current_email} emailFieldChanged={this.emailFieldChanged} />
      <ControlButtons buttons={this.state.buttons} buttonClicked={this.buttonClicked} />
    </div>
    );
    }
})


// container for all edit rows of objects loaded from DB
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
    const results = await $.get(this.props.source);
    this.setState({
      inboxes: JSON.parse(results),
    });
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


// button for submitting a new email username
var AddInboxButton = React.createClass({
  render: function() {
    return (
      <Button disabled={this.props.add_disabled} className="primary pull-right">Add Inbox</Button>
    );
  }
});


// container for add button and new inbox input field
var AddInboxForm = React.createClass({
  getInitialState: function(){
    return {add_disabled: true};
  },
  emailFieldChanged: function(value) {
    this.setState({current_email: value});
    if (validateEmailInput(value).success) {
      this.setState({add_disabled: false})
    } else {
      this.setState({add_disabled: true})
    }
    // TODO: Form validation instead of length checks
    // TODO: enable/disable add button
  },

  submitInbox: function() {
    // TODO: Submit API
  },
  render: function() {
    return (
      <div className="col-xs-12">
        <EmailInput emailFieldChanged={this.emailFieldChanged} />
        <AddInboxButton add_disabled={this.state.add_disabled} />
      </div>
    );
  },
});


// menu link to inbox management app screen
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


// menu link to overview of the entire nuo module
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


// inbox management app main page
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


// overview main display page
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


/// the container for the main page. the left side of the screen
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


// navigation links
var Menu = React.createClass({
  render: function() {
    return (
      <div className="col-xs-4">
        <div className="sidebar">
          <h2 className="top">Navigation</h2>
          <OverviewButton {...this.props} />
          <InboxManagementButton {...this.props} />
        </div>
      </div>
    );
  }
});


// the "master" container
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
