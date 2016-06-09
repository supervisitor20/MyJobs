import React, {PropTypes} from 'react';
import Button from 'react-bootstrap/lib/Button';

// navigation links
export class Menu extends React.Component {
  render() {
    const {tips, changePage} = this.props;
    const inboxTips = [
      'Use this page to manage the various email addresses to which ' +
      'you will have your employees send outreach emails',
    ];
    const outreachTips = [
      'Use this page to view outreach records from non-users',
    ];

    let tipsHeader;
    let tipsComponent;
    if (tips && tips.length > 0) {
      tipsComponent = tips.map((tip, i) => <p key={i}>{tip}</p>
      );
      tipsHeader = <h2>Tips</h2>;
    }

    return (

      <div className="col-xs-12 col-md-4">
        <div className="sidebar">
          <h2 className="top">Navigation</h2>
          <Button onClick={() => changePage('Overview')}>
            Overview
          </Button>
          <Button onClick={() => changePage('InboxManagement', inboxTips)}>
            Inbox Management
          </Button>
          <Button onClick={() => changePage('OutreachRecords', outreachTips)}>
            Outreach Records
          </Button>
          {tipsHeader}
          {tipsComponent}
        </div>
      </div>
    );
  }
}

Menu.propTypes = {
  tips: PropTypes.arrayOf(PropTypes.string).isRequired,
  changePage: PropTypes.func.isRequired,
};
