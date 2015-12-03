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
