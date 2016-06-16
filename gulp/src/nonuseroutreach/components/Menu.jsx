import React from 'react';
import {Link} from 'react-router';

// navigation links
export class Menu extends React.Component {
  render() {
    const {tips} = this.props;
    const pageTips = tips.length ? [
      <h2>Tips</h2>,
      tips.map((tip, i) => <p key={i}>{tip}</p>),
    ] : [];

    return (
        <div className="sidebar">
          <h2 className="top">Navigation</h2>
          <Link to="/overview" className="btn">
            Overview
          </Link>
          <Link to="/inboxes" className="btn">
            Inbox Management
          </Link>
          <Link to="/records" className="btn">
            Outreach Records
          </Link>
          {pageTips}
        </div>
    );
  }
}

Menu.propTypes = {
  tips: React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired,
};
