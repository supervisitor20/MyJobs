import React, {PropTypes} from 'react';

// Display errors from client-side form validation.. red text above stuff
export function HelpText(props) {
  const {message} = props;
  return (
    <div className="input-error">
      {message}
    </div>
  );
}

HelpText.propTypes = {
  message: PropTypes.string.isRequired,
};
