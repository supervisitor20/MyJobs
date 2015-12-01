import React from 'react';

class HelpText extends React.Component {
  render() {
    return (
      <div className="input-error">
        {this.props.message}
      </div>
    );
  }
}

export default HelpText;
