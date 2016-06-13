import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import {connect} from 'react-redux';

import {HelpText} from './HelpText';
import {EmailInput} from './EmailInput';
import {
  doCreateInbox,
  validateEmailAction,
} from '../actions/inbox-actions';

// container for add button and new inbox input field
class AddInboxForm extends React.Component {
  render() {
    const {dispatch, email, errors, isValid} = this.props;

    return (
      <div className="col-xs-12">
        {errors.map((error, index) =>
          <HelpText key={index} message={error} />)}
        <EmailInput
          id="add"
          email={email}
          emailFieldChanged={v => dispatch(validateEmailAction(v))} /> <Button
          className="primary pull-right margin-top"
          disabled={!isValid}
          onClick={() => dispatch(doCreateInbox(email))}>
          Add Inbox
        </Button>
      </div>
    );
  }
}

AddInboxForm.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  api: React.PropTypes.object.isRequired,
  email: React.PropTypes.string.isRequired,
  errors: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
  isValid: React.PropTypes.bool.isRequired,
};

export default connect(state => ({
  ...state.inboxManagement.newInbox,
}))(AddInboxForm);
