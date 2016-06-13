import React, {PropTypes} from 'react';
import {OutreachRecordTable} from './OutreachRecordTable';

// outreach record table view
export default class OutreachRecordPage extends React.Component {
  render() {
    return (
      <div>
          <div className="row">
            <div className="col-sm-12">
              <OutreachRecordTable {...this.props} />
            </div>
          </div>
      </div>
    );
  }
}

OutreachRecordPage.propTypes = {
  recordsManager: PropTypes.object.isRequired,
};
