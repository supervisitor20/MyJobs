import React from 'react';

class Status extends React.Component {
  render() {
    let button = '';
    if (this.props.status === true) {
      button = <span className="label label-success">Active</span>;
    }
    else if (this.props.status === false) {
      button = <span className="label label-warning">Pending</span>;
    }
    return (
      <span>
        {button}
      </span>
    );
  }
}

export default Status;
