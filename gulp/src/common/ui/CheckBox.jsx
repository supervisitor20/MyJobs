import React from 'react';

function CheckBox(props) {
  const {name, onChange, required, initial, isHidden} = props;
  return (
    <input
      type="checkbox"
      id={name}
      name={name}
      className=""
      required={required}
      hidden={isHidden}
      defaultChecked={initial}
      onChange={onChange}
      />
  );
}

CheckBox.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  name: React.PropTypes.string.isRequired,
  initial: React.PropTypes.bool,
  isHidden: React.PropTypes.bool,
  required: React.PropTypes.bool,
};

CheckBox.defaultProps = {
  initial: false,
  isHidden: false,
  required: false,
};

export default CheckBox;
