import React, {PropTypes} from 'react';
import {Link} from './Link';


export function WizardPagePresentationTypes(props) {
  const data = props.data;
  const rows = Object.keys(data).map(k =>
    <div key={k} className="row">
      <div className="span2" style={{textAlign: 'right'}}>
      </div>
      <div className="span4">
        <Link id={k} label={data[k].name}
          linkClick={() => props.selected(k)}/>
      </div>
    </div>
  );

  return (
    <div>
      <div className="row">
        <div className="span2" style={{textAlign: 'right'}}>
        </div>
        <div className="span4">
          <h4>Presentation Types</h4>
        </div>
      </div>
      {rows}
    </div>
  );
}

WizardPagePresentationTypes.propTypes = {
  data: PropTypes.object.isRequired,
  selected: PropTypes.func.isRequired,
};
