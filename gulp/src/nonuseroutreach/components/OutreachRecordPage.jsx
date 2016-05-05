import React from 'react';
import {OutreachRecordTable} from './OutreachRecordTable';

// outreach record table view
export function OutreachRecordPage(props) {
  return (
    <div>
        <div className="row">
          <div className="col-sm-12">
            <OutreachRecordTable {...props} />
          </div>
        </div>
    </div>
  );
}

OutreachRecordPage.propTypes = {}
