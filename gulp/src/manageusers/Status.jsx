import React from 'react';

class Status extends React.Component {
  render() {
    let button = '';
    if (this.props.status === true) {
      button = <span className="label label-success">Active</span>;
    } else if (this.props.status === false) {
      button = <span className="label label-warning">Pending<br/>{this.props.lastResponse}</span>;
    }
    return (
      <span>
        {button}
      </span>
    );
  }
}

Status.propTypes = {
  status: React.PropTypes.bool.isRequired,
  lastResponse: React.PropTypes.bool.isRequired,
};

Status.defaultProps = {
  status: false,
  lastResponse: false,
};

export default Status;
