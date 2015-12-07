import React, {Component, PropTypes} from 'react';
import Button from 'react-bootstrap/lib/Button';


// menu link to inbox management app screen
export class InboxManagementButton extends Component {
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
