import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';

import OutreachCardContainer from 'nonuseroutreach/components/OutreachCardContainer'

class OutreachDetails extends Component {
  render() {
    const {outreachBody, dateAdded, outreachFrom, outreachSubject} = this.props;
    return (
      <div>
      <OutreachCardContainer />
      <div className="sidebar">
        <h2 className="top">Communication Details</h2>
        <div style={{overflowWrap: 'break-word'}}>
          <div>Date Recieved: {dateAdded}</div>
          <div>From: {outreachFrom}</div>
          <div>Subject: {outreachSubject}</div>
          <div>Body: {outreachBody}</div>
        </div>
      </div>
      </div>
    );
  }
}

OutreachDetails.propTypes = {
  dateAdded: PropTypes.string.isRequired,
  outreachBody: PropTypes.string.isRequired,
  outreachFrom: PropTypes.string.isRequired,
  outreachSubject: PropTypes.string.isRequired,
};

export default connect(state => ({
  dateAdded: state.process.outreach.dateAdded,
  outreachBody: state.process.outreach.outreachBody,
  outreachFrom: state.process.outreach.outreachFrom,
  outreachSubject: state.process.outreach.subject,
}))(OutreachDetails);
