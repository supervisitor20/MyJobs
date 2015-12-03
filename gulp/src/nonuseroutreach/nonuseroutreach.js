import React, {Component, PropTypes} from 'react';
import Button from 'react-bootstrap/lib/Button';


/**
 * Contain dynamic email editing states
 *
 * type is text of button function identifier
 * disabled is whether the button is disabled or not
 *
 * by default, it is not disabled
 */
class ControlButton {
  constructor(type, disabled, primary, callback) {
    this.type = type;
    this.disabled = disabled;
    this.primary = primary;
    this.callback = callback;
  }
}

// Display errors from client-side form validation.. red text above stuff
function HelpText(props) {
  const {message} = props;
  return (
    <div className="input-error">
      {message}
    </div>
  );
}

HelpText.propTypes = {
  message: PropTypes.string.isRequired,
};


/**
 * creates span with buttons for saving, deleting, and canceling changes
 * to an existing inbox
 */
class ControlButtons extends Component {
  handleButtonClick(i) {
    this.props.buttonClicked(this.props.buttons[i]);
  }

  render() {
    const {buttons} = this.props;
    const buttonComponents = buttons.map((button, i) => {
      const classes = [
        'pull-right',
        'margin-top',
      ];
      if (button.primary) {
        classes.push('primary');
      }
      return (
        <Button
          disabled={button.disabled}
          className={classes}
          onClick={() => this.handleButtonClick(i)}
          key={i}>{button.type}</Button>
      );
    });
    return (
      <span>{buttonComponents}</span>
    );
  }
}

ControlButtons.propTypes = {
  buttonClicked: PropTypes.func.isRequired,
  buttons: PropTypes.arrayOf(PropTypes.object),
};


/**
 * textbox for entering email usernames
 *
 * used in both add and edit functions
 */
class EmailInput extends Component {
  emailChanged() {
    this.props.emailFieldChanged(this.refs.email_input.value.trim());
  }

  render() {
    return (
      <div className="input-group">
        <input
          type="text"
          className="email-input form-control"
          id={this.props.id}
          value={this.props.email}
          onChange={() => this.emailChanged()}
          ref="email_input" />
        <span className="input-group-addon">@my.jobs</span>
      </div>
    );
  }
}

EmailInput.propTypes = {
  emailFieldChanged: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};


/**
 * individual inbox loaded from DB
 *
 * contains inbox textbox and control buttons
 */
class InboxRow extends Component {
  constructor(props) {
    super(props);
    const {inbox} = props;
    this.state = {
      id: inbox.pk,
      initial_email: inbox.fields.email,
      current_email: inbox.fields.email,
      validationMessages: [],
    };
  }

  emailFieldChanged(value) {
    const {inboxManager} = this.props;
    const validationObject = inboxManager.validateEmailInput(value);
    this.setState({
      current_email: value,
      success: validationObject.success,
      validationMessages: validationObject.messages,
    });
  }

  deleteEmail() {
    /*
    // Taking out since eslint hates confirm.
    // Need a real modal here.
    const message = 'Are you sure you want to delete ' +
      this.state.initial_email + '@my.jobs?';
    if (!confirm(message)) {
      return;
    }
    */
    this.props.handleDelete(this.props.index);
  }

  saveEmail() {
    this.props.loadInboxesFromApi();
    return;
  }

  cancelChanges() {
    this.setState({
      current_email: this.state.initial_email,
      validationMessages: [],
    });
  }

  render() {
    const validationMessages =
      this.state.validationMessages.map((message, i) =>
        <HelpText message={message} key={i} />
      );
    let buttons;
    if (this.state.current_email !== this.state.initial_email) {
      buttons = [
        new ControlButton('Save', !this.state.success, true,
          () => this.saveEmail()),
        new ControlButton('Cancel', false, false, () => this.cancelChanges()),
      ];
    } else {
      buttons = [
        new ControlButton('Delete', false, true, () => this.deleteEmail()),
      ];
    }
    return (
      <div className="clearfix product-card no-highlight">
        {validationMessages}
        <EmailInput
          id={this.state.id}
          email={this.state.current_email}
          emailFieldChanged={v => this.emailFieldChanged(v)} />
        <ControlButtons
          buttons={buttons}
          buttonClicked={b => b.callback()} />
      </div>
    );
  }
}

InboxRow.propTypes = {
  inbox: PropTypes.object.isRequired,
  inboxManager: PropTypes.object.isRequired,
  handleDelete: PropTypes.func.isRequired,
  loadInboxesFromApi: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};


// container for all edit rows of objects loaded from DB
class InboxList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inboxes: [],
    };
  }

  componentDidMount() {
    this.loadInboxesFromApi();
  }

  handleDelete(index) {
    this.setState({
      inboxes: this.state.inboxes.filter((_, i) => i !== index),
    });
  }

  async loadInboxesFromApi() {
    const results = await this.props.inboxManager.getExistingInboxes();
    this.setState({
      inboxes: results,
    });
  }

  render() {
    const {inboxes} = this.state;
    if (inboxes.length === 0) {
      return (<div></div>);
    }

    return (
      <div className="col-xs-12 ">
        <div className="wrapper-header">
          <h2>Existing Inbox Management</h2>
        </div>
        <div className="partner-holder">
          {inboxes.map((inboxOb, i) =>
            <InboxRow
              inbox={inboxOb}
              key={inboxOb.pk}
              index={i}
              handleDelete={index => this.handleDelete(index)}
              loadInboxesFromApi={() => this.loadInboxesFromApi()}
              inboxManager={this.props.inboxManager} />
          )}
        </div>
      </div>
    );
  }
}

InboxList.propTypes = {
  inboxManager: PropTypes.object.isRequired,
};


// button for submitting a new email username
function AddInboxButton(props) {
  return (
    <Button
      disabled={props.addDisabled}
      className="primary pull-right margin-top">
        Add Inbox
    </Button>
  );
}

AddInboxButton.propTypes = {
  addDisabled: PropTypes.bool.isRequired,
};


// container for add button and new inbox input field
class AddInboxForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addDisabled: true,
      validationMessages: [],
    };
  }

  emailFieldChanged(value) {
    const {inboxManager} = this.props;
    const validationObject = inboxManager.validateEmailInput(value);
    this.setState({
      current_email: value,
      validationMessages: validationObject.messages,
    });
    if (validationObject.success) {
      this.setState({addDisabled: false});
    } else {
      this.setState({addDisabled: true});
    }
  }

  submitInbox() {
    // TODO: Submit API
  }

  render() {
    const validationMessages = this.state.validationMessages.map((message) =>
      <HelpText message={message} />
    );
    return (
      <div className="col-xs-12">
        {validationMessages}
        <EmailInput emailFieldChanged={v => this.emailFieldChanged(v)} />
        <AddInboxButton addDisabled={this.state.addDisabled} />
      </div>
    );
  }
}

AddInboxForm.propTypes = {
  inboxManager: PropTypes.object.isRequired,
};


// inbox management app main page
function InboxManagementPage(props) {
  const {inboxManager} = props;
  return (
    <div>
      <div className="card-wrapper">
        <div className="row">
          <InboxList inboxManager={inboxManager} />
        </div>
      </div>
      <div className="card-wrapper">
        <div className="row">
          <div className="col-xs-12 ">
            <div className="wrapper-header">
              <h2>Add New Inbox</h2>
            </div>
            <div className="partner-holder no-highlight">
              <div className="product-card no-highlight clearfix">
                <AddInboxForm inboxManager={inboxManager} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

InboxManagementPage.propTypes = {
  inboxManager: PropTypes.object.isRequired,
};

// overview main display page
function OverviewPage() {
  return (
    <div className="card-wrapper">
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Overview</h2>
          </div>
          <div className="product-card no-highlight">
            <p>
              Non User Outreach is a module that will help you manage
              and track positive outreach efforts by your employees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

OverviewPage.propTypes = {};


// the container for the main page. the left side of the screen
function Content(props) {
  const {page, inboxManager} = props;
  let pageComponent;
  switch (page) {
  case 'Overview':
    pageComponent = <OverviewPage />;
    break;
  case 'InboxManagement':
    pageComponent = <InboxManagementPage inboxManager={inboxManager} />;
    break;
  default:
    pageComponent = '';
  }
  return (
    <div className="col-xs-8">
        {pageComponent}
    </div>
  );
}

Content.propTypes = {
  inboxManager: PropTypes.object.isRequired,
  page: PropTypes.string.isRequired,
};


// menu link to inbox management app screen
class InboxManagementButton extends Component {
  handleClick() {
    const {changePage} = this.props;
    changePage('InboxManagement', [
      'Use this page to manage the various email addresses to which ' +
      'you will have your employees send outreach emails',
    ]);
  }

  render() {
    return (
      <Button onClick={() => this.handleClick()}>Inbox Management</Button>
    );
  }
}

InboxManagementButton.propTypes = {
  changePage: PropTypes.func.isRequired,
};


// menu link to overview of the entire nuo module
class OverviewButton extends Component {
  handleClick() {
    this.props.changePage('Overview');
  }

  render() {
    return (
      <Button onClick={() => this.handleClick()}>Overview</Button>
    );
  }
}

OverviewButton.propTypes = {
  changePage: PropTypes.func.isRequired,
};


// navigation links
function Menu(props) {
  const {tips, changePage} = props;
  let tipsHeader;
  let tipsComponent;
  if (tips && tips.length > 0) {
    tipsComponent = tips.map((tip, i) => <p key={i}>{tip}</p>
    );
    tipsHeader = <h2>Tips</h2>;
  }
  return (
    <div className="col-xs-4">
      <div className="sidebar">
        <h2 className="top">Navigation</h2>
        <OverviewButton changePage={changePage} />
        <InboxManagementButton changePage={changePage} />
        {tipsHeader}
        {tipsComponent}
      </div>
    </div>
  );
}

Menu.propTypes = {
  tips: PropTypes.arrayOf(PropTypes.string).isRequired,
  changePage: PropTypes.func.isRequired,
};

// the "master" container
export class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'Overview',
      company: 'DirectEmployers',
      tips: [],
    };
  }

  /**
   * change what is displayed in the "Content" div.
   *
   * option parameter "tips" allows a list of tips to display beneath
   * the navigation menu
   */
  changePage(page, tips = []) {
    this.setState({page, tips});
  }

  render() {
    const {page, tips} = this.state;
    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <h1>
              <a
                href="/manage-users/"
                title="Back to Manage Users">
                  DirectEmployers
              </a>
            </h1>
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
          <Content page={page} inboxManager={this.props.inboxManager} />
          <Menu changePage={(p, t) => this.changePage(p, t)} tips={tips} />
        </div>
        <div className="clearfix"></div>
      </div>
    );
  }
}

Container.propTypes = {
  inboxManager: PropTypes.object.isRequired,
};
