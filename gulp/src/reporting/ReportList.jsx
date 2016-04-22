import React, {PropTypes, Component} from 'react';
import {Link} from 'react-router';
import {map} from 'lodash-compat';
import PopMenu from 'common/ui/PopMenu';

export class ReportList extends Component {
  handlePreviewReport(report) {
    const {history} = this.props;
    const href = '/preview/' + report.id;
    const query = {
      reportName: report.name,
      reportType: report.report_type,
    };
    history.pushState(null, href, query);
  }

  handleExportReport(report) {
    const {history} = this.props;
    const href = '/export/' + report.id;
    history.pushState(null, href);
  }

  render() {
    const {reports, highlightId} = this.props;
    const reportLinks = map(reports, r =>
      <li
        className={highlightId === r.id ? 'active' : ''}
        key={r.id}>
        <PopMenu
          options={[
            {
              display: 'Preview',
              onSelect: () => {this.handlePreviewReport(r);},
            },
            {
              display: 'Export',
              onSelect: () => {this.handleExportReport(r);},
            },
          ]}/>
        {r.name}
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
}

ReportList.propTypes = {
  history: PropTypes.object.isRequired,
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      report_type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  highlightId: PropTypes.number,
};
