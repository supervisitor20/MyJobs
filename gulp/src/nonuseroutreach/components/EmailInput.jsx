import React, {Component, PropTypes} from 'react';

/**
 * textbox for entering email usernames
 *
 * used in both add and edit functions
 */
export class EmailInput extends Component {
  handleChange() {
    this.props.onChange(this.refs.email_input.value.trim());
  }

  render() {
    return (
      <div className="input-group">
        <input
          type="text"
          className="email-input form-control"
          id={this.props.id}
          value={this.props.email}
          onChange={() => this.handleChange()}
          ref="email_input"
          autoFocus/>
        <span className="input-group-addon">@my.jobs</span>
      </div>
    );
  }
}

EmailInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  email: PropTypes.string,
};
