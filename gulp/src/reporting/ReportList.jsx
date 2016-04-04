import React, {PropTypes} from 'react';
import {Link} from 'react-router';

export function ReportList(props) {
  const reportData = props.reports.map(report => ({
    id: report.id,
    name: report.name,
  }));
  const reportLinks = reportData.map(r =>
    <li key={r.id}>
      <Link to={'/export/' + r.id}>{r.name}</Link>
    </li>
  );

  return (
    <div>
      <div className="sidebar">
        <h2 className="top">Reports</h2>
        {reportLinks}
      </div>
    </div>
  );
}

ReportList.propTypes = {
  reports: PropTypes.arrayOf(PropTypes.object).isRequired,
};
