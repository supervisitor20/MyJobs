import React from 'react';

const HelpText = React.createClass({
  propTypes: {
    message: React.PropTypes.string.isRequired,
  },
  render() {
    return (
      <div className="input-error">
        {this.props.message}
      </div>
    );
  },
});

export default HelpText;
