import React, {PropTypes} from 'react';
import Modal from 'react-bootstrap/lib/Modal';


export default function Confirm(props) {
  const {show, message, onResolve} = props;

  return (
    <Modal show={show} onHide={() => onResolve(false)}>
      <Modal.Body>
      {message}
      </Modal.Body>
      <Modal.Footer>
          <button
            className="button primary wide"
            onClick={e => {e.preventDefault(); onResolve(true);}}>
            Ok
          </button>
          <button
            className="button primary wide"
            onClick={e => {e.preventDefault(); onResolve(false);}}>
            Cancel
          </button>
      </Modal.Footer>
    </Modal>
  );
}

Confirm.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string,
  onResolve: PropTypes.func.isRequired,
};

Confirm.defaultProps = {
  message: 'Are you sure?',
};
