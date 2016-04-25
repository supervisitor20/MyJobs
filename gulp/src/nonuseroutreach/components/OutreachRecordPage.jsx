import React from 'react';
import {OutreachRecordTable} from './OutreachRecordTable';

// outreach record table view
export function OutreachRecordPage(props) {
  return (
    <div>
      <div className="card-wrapper">
        <div className="row">
          <OutreachRecordTable />
        </div>
      </div>
    </div>
  );
}

OutreachRecordPage.propTypes = {}
