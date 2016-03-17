import React from 'react';

function BasicCheckBox(props) {
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

BasicCheckBox.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  name: React.PropTypes.string.isRequired,
  initial: React.PropTypes.bool,
  isHidden: React.PropTypes.bool,
  required: React.PropTypes.bool,
};

BasicCheckBox.defaultProps = {
  initial: false,
  isHidden: false,
  required: false,
};

export default BasicCheckBox;
