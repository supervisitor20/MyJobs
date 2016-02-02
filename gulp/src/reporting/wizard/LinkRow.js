import React, {PropTypes} from 'react';
import {Link} from 'react-router';


export function LinkRow(props) {
  const {text, label, to} = props;
  return (
    <div className="row">
      <div className="span2" style={{textAlign: 'right'}}>
        <Link to={to}>{label}</Link>
      </div>
      <div className="span4">{text}</div>
    </div>
  );
}

LinkRow.propTypes = {
  text: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};
