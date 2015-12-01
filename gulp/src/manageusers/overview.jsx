import React from 'react';


const Overview = React.createClass({
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Overview</h2>
          </div>
          <div className="product-card no-highlight">
            <p>Use this tool to create users and permit them to perform letious activities.</p>
            <p>First, create a role. A role is a group of activities (e.g. view existing communication records, add new communication records, etc.). Then, create a user and assign them to that role. Once assigned to a role, that user can execute activities assigned to that role.</p>
          </div>
        </div>
      </div>
    );
  },
});

export default Overview;
