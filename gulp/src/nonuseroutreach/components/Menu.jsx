import React from 'react';
import {Link} from 'react-router';

// navigation links
export class Menu extends React.Component {
  render() {
    return (
        <div className="sidebar">
          <h2 className="top">Navigation</h2>
          <Link to="overview" className="btn">
            Overview
          </Link>
          <Link to="inboxes" className="btn">
            Inbox Management
          </Link>
          <Link to="records" className="btn">
            Outreach Records
          </Link>
        </div>
    );
  }
}
