import React, {PropTypes} from 'react';

import {OverviewPage} from './OverviewPage';
import {InboxManagementPage} from './InboxManagementPage';


// the container for the main page. the left side of the screen
export function Content(props) {
  const {page, inboxManager} = props;
  let pageComponent;
  switch (page) {
  case 'Overview':
    pageComponent = <OverviewPage />;
    break;
  case 'InboxManagement':
    pageComponent = <InboxManagementPage inboxManager={inboxManager} />;
    break;
  default:
    pageComponent = '';
  }
  return (
    <div className="col-xs-8">
        {pageComponent}
    </div>
  );
}

Content.propTypes = {
  inboxManager: PropTypes.object.isRequired,
  page: PropTypes.string.isRequired,
};
