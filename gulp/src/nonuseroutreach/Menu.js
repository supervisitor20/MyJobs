import React, {PropTypes} from 'react';

import {InboxManagementButton} from './InboxManagementButton';
import {OverviewButton} from './OverviewButton';


// navigation links
export function Menu(props) {
  const {tips, changePage} = props;
  let tipsHeader;
  let tipsComponent;
  if (tips && tips.length > 0) {
    tipsComponent = tips.map((tip, i) => <p key={i}>{tip}</p>
    );
    tipsHeader = <h2>Tips</h2>;
  }
  return (
    <div className="col-xs-4">
      <div className="sidebar">
        <h2 className="top">Navigation</h2>
        <OverviewButton changePage={changePage} />
        <InboxManagementButton changePage={changePage} />
        {tipsHeader}
        {tipsComponent}
      </div>
    </div>
  );
}

Menu.propTypes = {
  tips: PropTypes.arrayOf(PropTypes.string).isRequired,
  changePage: PropTypes.func.isRequired,
};
