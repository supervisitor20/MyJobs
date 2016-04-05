import React, {PropTypes} from 'react';

export function ReportList(props) {
  const reportData = props.reports.map(report => ({
    id: report.id,
    name: report.name,
    href: '/reports/view/dynamicdownload?id=' + report.id,
  }));
  const reportLinks = reportData.map(r =>
    <li key={r.id}>
      <a href={r.href}>{r.name}</a>
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
