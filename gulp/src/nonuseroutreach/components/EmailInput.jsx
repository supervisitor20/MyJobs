import React, {Component, PropTypes} from 'react';

import {
  InputGroup,
  FormControl,
} from 'react-bootstrap';

/**
 * textbox for entering email usernames
 *
 * used in both add and edit functions
 */
export class EmailInput extends Component {
  handleChange(e) {
    this.props.onChange(e.target.value);
  }

  render() {
    const {id, email} = this.props;

    return (
      <InputGroup>
        <FormControl
          type="text"
          className="email-input"
          id={id}
          value={email}
          ref="email_input"
          autoFocus
          onChange={e => this.handleChange(e)} />
        <InputGroup.Addon>@my.jobs</InputGroup.Addon>
      </InputGroup>
    );
  }
}

EmailInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  email: PropTypes.string,
};
