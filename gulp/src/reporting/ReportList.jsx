import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {map} from 'lodash-compat';

export function ReportList(props) {
  const {reports} = props;
  const reportLinks = map(reports, r =>
    <li key={r.id}>
      <Link to={'/export/' + r.id}>{r.name}</Link>
      <Link
        to={'/preview/' + r.id}
        query={{
          reportName: r.name,
          reportType: r.report_type,
        }}>[preview]</Link>
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
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      report_type: PropTypes.string.isRequired,
    }),
  ).isRequired,
};
