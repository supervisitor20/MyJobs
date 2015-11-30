import React, {PropTypes} from 'react';
import {Link} from './Link';


export function LinkRow(props) {
  return (
    <div className="row">
      <div className="span2" style={{textAlign: 'right'}}>
        <Link
          linkClick={() => props.linkClick(props.id)}
          label={props.label}/>
      </div>
      <div className="span4">{props.text}</div>
    </div>
  );
}

LinkRow.propTypes = {
  linkClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};
