import React from 'react';

/**
 * Simple input element with onChange handler
 */
function TextField(props) {
  const {name, onChange, required, maxLength, value, isHidden, placeholder, autoFocus, onSelect} = props;
  return (
    <input
      type="text"
      autoComplete="off"
      id={name}
      name={name}
      className=""
      maxLength={maxLength}
      required={required}
      hidden={isHidden}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      autoFocus={autoFocus}
      onSelect={onSelect}
      />
  );
}

TextField.propTypes = {
  /**
  * Callback: the user edited this field
  *
  * obj: change event
  */
  onChange: React.PropTypes.func.isRequired,
  /**
   * under_score_seperated, unique name of this field. Used to post form
   * content to Django
   */
  name: React.PropTypes.string.isRequired,
  /**
   * Placeholder text for the input control
   */
  placeholder: React.PropTypes.string,
  /**
   * Value shown in control
   */
  value: React.PropTypes.string,
  /**
   * Number of characters allowed in this field
   */
  maxLength: React.PropTypes.number,
  /**
   * Should this component be shown or not?
   */
  isHidden: React.PropTypes.bool,
  /**
   * Must this field have a value before submitting form?
   */
  required: React.PropTypes.bool,
  /**
   * Should this bad boy focus, all auto like?
   */
  autoFocus: React.PropTypes.any,
  /**
   * What happens if you click this field?f
   */
  onSelect: React.PropTypes.func,
};

TextField.defaultProps = {
  placeholder: '',
  value: '',
  maxLength: null,
  isHidden: false,
  required: false,
  autoFocus: false,
  onSelect: null,
};

export default TextField;
