import React, {PropTypes} from 'react';
import {LinkRow} from './LinkRow';


export function WizardPageDataTypes(props) {
  const data = props.data;
  const rows = Object.keys(data).map(k =>
    <LinkRow key={k} id={k} label={data[k].name}
      text={data[k].description}
      linkClick={() => props.selected(k)}/>
  );

  return (
    <div>
      <div className="row">
        <div className="span2" style={{textAlign: 'right'}}>
        </div>
        <div className="span4">
          <h4>Data Types</h4>
        </div>
      </div>
      {rows}
    </div>
  );
}

WizardPageDataTypes.propTypes = {
  data: PropTypes.object.isRequired,
  selected: PropTypes.func.isRequired,
};
