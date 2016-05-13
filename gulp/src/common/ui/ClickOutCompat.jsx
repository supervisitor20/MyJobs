import React, {PropTypes} from 'react';
import ClickOutHandler from 'react-onclickout';

export default function ClickOutCompat(props) {
  const {children, onClickOut} = props;

  if (window.addEventListener) {
    return (
      <ClickOutHandler onClickOut={(...args) => onClickOut(...args)}>
        {children}
      </ClickOutHandler>
    );
  }
  return children;
}

ClickOutCompat.propTypes = {
  children: PropTypes.node.isRequired,
  onClickOut: PropTypes.func.isRequired,
};
