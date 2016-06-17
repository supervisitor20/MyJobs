import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';


/**
 * Show a confirm modal containing a message and ok/cancel buttons.
 *
 * This component must be in the vdom for the confirmModal method to work.
 *
 * All props are connected so just include the Component.
 * i.e.: <Confirm/>
 */
function Confirm(props) {
  const {show, message, onResolve} = props;

  return (
    <Modal show={show} onHide={() => onResolve(false)}>
      <Modal.Body>
      {message}
      </Modal.Body>
      <Modal.Footer>
          <Button
            bsStyle="primary"
            block
            onClick={e => {e.preventDefault(); onResolve(true);}}>
            Ok
          </Button>
          <Button
            block
            onClick={e => {e.preventDefault(); onResolve(false);}}>
            Cancel
          </Button>
      </Modal.Footer>
    </Modal>
  );
}

Confirm.propTypes = {
  // Should the dialog show right now?
  show: PropTypes.bool.isRequired,
  // What message should it show?
  message: PropTypes.string,
  // Callback for when a button is clicked.
  onResolve: PropTypes.func,
};

Confirm.defaultProps = {
  message: 'Are you sure?',
};

export default connect(s => ({
  show: s.confirm.data.show,
  message: s.confirm.data.message,
  onResolve: s.confirm.resolve,
}))(Confirm);
