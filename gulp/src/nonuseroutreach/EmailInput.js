import React, {Component, PropTypes} from 'react';

/**
 * textbox for entering email usernames
 *
 * used in both add and edit functions
 */
export class EmailInput extends Component {
  emailChanged() {
    this.props.emailFieldChanged(this.refs.email_input.value.trim());
  }

  render() {
    return (
      <div className="input-group">
        <input
          type="text"
          className="email-input form-control"
          id={this.props.id}
          value={this.props.email}
          onChange={() => this.emailChanged()}
          ref="email_input" />
        <span className="input-group-addon">@my.jobs</span>
      </div>
    );
  }
}

EmailInput.propTypes = {
  emailFieldChanged: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  email: PropTypes.string,
};
