import React, {PropTypes} from 'react';

import {InboxList} from './InboxList';
import {AddInboxForm} from './AddInboxForm';


// inbox management app main page
export default class InboxManagementPage {
  render() {
    const {inboxManager} = this.props;
    return (
      <div>
        <InboxList inboxManager={inboxManager} />
        <div className="card-wrapper">
          <div className="row">
            <div className="col-xs-12 ">
              <div className="wrapper-header">
                <h2>Add New Inbox</h2>
              </div>
              <div className="partner-holder no-highlight">
                <div className="product-card no-highlight clearfix">
                  <AddInboxForm inboxManager={inboxManager} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

InboxManagementPage.propTypes = {
  inboxManager: PropTypes.object.isRequired,
};
