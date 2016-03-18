
import React from 'react';

function Textarea(props) {
  const {name, onChange, required, initial, isHidden, placeholder} = props;
  return (
    <textarea
      defaultValue={initial}
      id={name}
      name={name}
      required={required}
      hidden={isHidden}
      placeholder={placeholder}
      onChange={onChange}
      />
  );
}

Textarea.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  name: React.PropTypes.string.isRequired,
  placeholder: React.PropTypes.string,
  initial: React.PropTypes.string,
  isHidden: React.PropTypes.bool,
  required: React.PropTypes.bool,
};

Textarea.defaultProps = {
  placeholder: '',
  initial: '',
  isHidden: false,
  required: false,
};

export default Textarea;
