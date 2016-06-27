import React, {PropTypes} from 'react';

/* HelpText
 * Component for displaying a validation error.
 */
export default function HelpText(props) {
  const {message} = props;
  return (
    <div className="input-error">
      {message}
    </div>
  );
}

HelpText.propTypes = {
  // the error message to display
  message: PropTypes.string.isRequired,
};
