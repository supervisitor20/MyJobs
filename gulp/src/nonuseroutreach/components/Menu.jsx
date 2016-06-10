import React from 'react';
import Button from 'react-bootstrap/lib/Button';

// navigation links
export class Menu extends React.Component {
  render() {
    return (
        <div className="sidebar">
          <h2 className="top">Navigation</h2>
          <Button onClick={() => console.log('Overview')}>
            Overview
          </Button>
          <Button onClick={() => console.log('Inbox Management')}>
            Inbox Management
          </Button>
          <Button onClick={() => console.log('Outreach Records')}>
            Outreach Records
          </Button>
        </div>
    );
  }
}
