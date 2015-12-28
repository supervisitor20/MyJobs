import React from 'react';


// overview main display page
export function OverviewPage() {
  return (
    <div className="card-wrapper">
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Overview</h2>
          </div>
          <div className="product-card no-highlight">
            <p>
              Non User Outreach is a module that will help you manage
              and track positive outreach efforts by your employees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

OverviewPage.propTypes = {};
