import React from 'react';

function BasicTextField(props) {
  const {name, onChange, required, maxLength, initial, isHidden, placeholder} = props;
  return (
    <input
      type="text"
      id={name}
      name={name}
      className=""
      maxLength={maxLength}
      required={required}
      hidden={isHidden}
      defaultValue={initial}
      placeholder={placeholder}
      onChange={onChange}
      />
  );
}

BasicTextField.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  name: React.PropTypes.string.isRequired,
  placeholder: React.PropTypes.string,
  initial: React.PropTypes.string,
  maxLength: React.PropTypes.number,
  isHidden: React.PropTypes.bool,
  required: React.PropTypes.bool,
};

BasicTextField.defaultProps = {
  placeholder: '',
  initial: '',
  maxLength: null,
  isHidden: false,
  required: false,
};

export default BasicTextField;
