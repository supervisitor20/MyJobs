import React, {Component, PropTypes} from 'react';

import {HelpText} from './HelpText';
import {EmailInput} from './EmailInput';
import {AddInboxButton} from './AddInboxButton';

// container for add button and new inbox input field
export class AddInboxForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addDisabled: true,
      validationMessages: [],
    };
  }

  onClick() {
    this.props.inboxManager.createNewInbox(this.state.currentEmail);
    this.setState({
      currentEmail: '',
    });
  }


  emailFieldChanged(value) {
    const {inboxManager} = this.props;
    const validationObject = inboxManager.validateEmailInput(value);
    this.setState({
      currentEmail: value,
      validationMessages: validationObject.messages,
    });
    if (validationObject.success) {
      this.setState({addDisabled: false});
    } else {
      this.setState({addDisabled: true});
    }
  }

  render() {
    const validationMessages = this.state.validationMessages.map((message) =>
      <HelpText message={message} />
    );
    return (
      <div className="col-xs-12">
        {validationMessages}
        <EmailInput
          id="add"
          email={this.state.currentEmail}
          emailFieldChanged={v => this.emailFieldChanged(v)} />
        <AddInboxButton
          addDisabled={this.state.addDisabled}
          onClick={() => this.onClick()} />
      </div>
    );
  }
}

AddInboxForm.propTypes = {
  inboxManager: React.Proptypes.object.isRequired,
};
