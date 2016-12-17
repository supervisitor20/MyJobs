import React from 'react';
import {Component} from 'react';

class NoResults extends Component {
  render() {
    const {type, errorMessage} = this.props;
    switch (type) {
    case 'table':
      return (
        <tr className="table-no-results">
          <td colSpan="8">{errorMessage}</td>
        </tr>
      );
    case 'div':
      return (
        <div className="no-results">
          <h1>{errorMessage}</h1>
        </div>
      );
    default:
      return (
        <div className="no-result">
          <h1>{errorMessage}</h1>
        </div>
      );
    }
  }
}

NoResults.propTypes = {
  // Input the type to display for html format
  type: React.PropTypes.string.isRequired,
  // Error message to display
  errorMessage: React.PropTypes.string.isRequired,
};

export default NoResults;
