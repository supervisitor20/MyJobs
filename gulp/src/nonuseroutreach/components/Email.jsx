import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';

class Email extends Component {
  render() {
    const {outreachBody, dateAdded, outreachFrom} = this.props;
    return (
      <div className="sidebar">
        <h2 className="top">Communication Details</h2>
        <div style={{overflowWrap: 'break-word'}}>
          <div>Date Recieved: {dateAdded}</div>
          <div>From: {outreachFrom}</div>
          <div>Body: {outreachBody}</div>
        </div>
      </div>
    );
  }
}

Email.propTypes = {
  dateAdded: PropTypes.string.isRequired,
  outreachBody: PropTypes.string.isRequired,
  outreachFrom: PropTypes.string.isRequired,
};

export default connect(state => ({
  dateAdded: state.process.outreach.dateAdded,
  outreachBody: state.process.outreach.outreachBody,
  outreachFrom: state.process.outreach.outreachFrom,
}))(Email);
