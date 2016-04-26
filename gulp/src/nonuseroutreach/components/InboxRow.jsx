import React, {Component, PropTypes} from 'react';

import {HelpText} from './HelpText';
import {EmailInput} from './EmailInput';
import {ControlButtons} from './ControlButtons';


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

/**
 * individual inbox loaded from DB
 *
 * contains inbox textbox and control buttons
 */
export class InboxRow extends Component {
  constructor(props) {
    super(props);
    const {inbox} = props;
    this.state = {
      id: inbox.pk,
      initial_email: inbox.fields.email,
      currentEmail: inbox.fields.email,
      validationMessages: [],
    };
  }

  emailFieldChanged(value) {
    const {inboxManager} = this.props;
    const validationObject = inboxManager.validateEmailInput(value);
    this.setState({
      currentEmail: value,
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

  updateEmail() {
    const {inboxManager} = this.props;
    const validationObject = inboxManager.validateEmailInput(
      this.state.currentEmail);
    if (validationObject.success) {
      inboxManager.updateInbox(this.state.id, this.state.currentEmail);
      this.props.loadInboxesFromApi();

      this.setState({
        initial_email: this.state.currentEmail,
        validationMessages: [],
      });
    }
    return;
  }

  cancelChanges() {
    this.setState({
      currentEmail: this.state.initial_email,
      validationMessages: [],
    });
  }

  render() {
    const validationMessages =
      this.state.validationMessages.map((message, i) =>
        <HelpText message={message} key={i} />
      );
    let buttons;
    if (this.state.currentEmail !== this.state.initial_email) {
      buttons = [
        new ControlButton('Update', !this.state.success, true,
          () => this.updateEmail()),
        new ControlButton('Cancel', false, false, () => this.cancelChanges()),
      ];
    } else {
      buttons = [
        new ControlButton('Delete', false, true, () => this.deleteEmail()),
      ];
    }
    return (
      <div className="product-card no-highlight clearfix ">
        {validationMessages}
        <div className="col-xs-12">
          <EmailInput
            id={this.state.id.toString()}
            email={this.state.currentEmail}
            emailFieldChanged={v => this.emailFieldChanged(v)} />
          <ControlButtons
            buttons={buttons}
            buttonClicked={b => b.callback()} />
          </div>
      </div>
    );
  }
}

InboxRow.propTypes = {
  inbox: React.Proptypes.object.isRequired,
  inboxManager: React.Proptypes.object.isRequired,
  handleDelete: React.Proptypes.func.isRequired,
  loadInboxesFromApi: React.Proptypes.func.isRequired,
  index: React.Proptypes.number.isRequired,
};
