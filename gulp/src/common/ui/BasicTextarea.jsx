
import React from 'react';

function BasicTextarea(props) {
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

BasicTextarea.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  name: React.PropTypes.string.isRequired,
  placeholder: React.PropTypes.string,
  initial: React.PropTypes.string,
  isHidden: React.PropTypes.bool,
  required: React.PropTypes.bool,
};

BasicTextarea.defaultProps = {
  placeholder: '',
  initial: '',
  isHidden: false,
  required: false,
};

export default BasicTextarea;
