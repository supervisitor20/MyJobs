import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import {map} from 'lodash-compat';
import PopMenu from 'common/ui/PopMenu';

export function ReportList(props) {
  const {reports, highlightId} = props;
  const reportLinks = map(reports, r =>
    <li
      className={highlightId === r.id ? 'active' : ''}
      key={r.id}>
      <PopMenu
        // onShow={this.shown}
        options={[
          {display: 'feathersfeathersfeathers they\'re everywhere'},
          {display: 'goat spit'},
          {display: 'problems'},
          {display: 'The Elderly.'},
        ]}
      />
      <Link to={'/export/' + r.id}>{r.name}</Link>
      {" "}
      <Link
        to={'/preview/' + r.id}
        query={{
          reportName: r.name,
          reportType: r.report_type,
        }}>[preview]</Link>
      {" "}
      <Link to={'/export/' + r.id}>[export]</Link>
    </li>
  );

  return (
    <div>
      <div className="sidebar reporting">
        <h2 className="top">Saved Reports</h2>
          <ul>
            <li>
              <Link to="/set-up-report">Create new report...</Link>
            </li>
            {reportLinks}
          </ul>
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
  highlightId: PropTypes.number,
};
