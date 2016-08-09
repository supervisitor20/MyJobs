import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';

class Email extends Component {
  render() {
    const {emailBody, dateAdded, emailFrom} = this.props;
    return (
      <div className="sidebar">
        <h2 className="top">Communication Details</h2>
        <div style={{overflowWrap: 'break-word'}}>
          <div>Date Recieved: {dateAdded}</div>
          <div>From: {emailFrom}</div>
          <div>Body: {emailBody}</div>
        </div>
      </div>
    );
  }
}

Email.propTypes = {
  dateAdded: PropTypes.string.isRequired,
  emailBody: PropTypes.string.isRequired,
  emailFrom: PropTypes.string.isRequired,
};

export default connect(state => ({
  dateAdded: state.process.email.date_added,
  emailBody: state.process.email.email_body,
  emailFrom: state.process.email.from_email,
}))(Email);
