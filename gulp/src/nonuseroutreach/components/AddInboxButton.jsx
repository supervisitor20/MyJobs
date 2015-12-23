import React, {PropTypes} from 'react';
import Button from 'react-bootstrap/lib/Button';


// button for submitting a new email username
export function AddInboxButton(props) {
  return (
    <Button
      disabled={props.addDisabled}
      className="primary pull-right margin-top">
        Add Inbox
    </Button>
  );
}

AddInboxButton.propTypes = {
  addDisabled: PropTypes.bool.isRequired,
};
