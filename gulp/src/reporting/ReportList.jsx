import React, {PropTypes, Component} from 'react';
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

  handleCreateNewReport(e) {
    const {history, onClearReportConfiguration} = this.props;
    e.preventDefault();
    history.pushState(null, '/set-up-report', {});
    setTimeout(() => onClearReportConfiguration());
  }

  render() {
    const {reports, highlightId} = this.props;
    const reportLinks = map(reports, r => {
      const options = [];
      if (r.report_type && r.id) {
        options.push({
          display: 'Preview',
          onSelect: () => {this.handlePreviewReport(r);},
        });
      }
      if (r.id) {
        options.push({
          display: 'Export',
          onSelect: () => {this.handleExportReport(r);},
        });
      }
      return (
        <li
          className={highlightId === r.id ? 'active' : ''}
          key={r.id}>
          {options.length > 0 ? <PopMenu options={options}/> : ''}
          {r.isRunning ? <span className="report-loader"></span> : ''}
          <span className="menu-text">{r.name}</span>
        </li>
      );
    });

    return (
      <div>
        <div className="sidebar reporting">
          <h2 className="top">Saved Reports</h2>
          <button
            className="button primary wide"
            onClick={e => this.handleCreateNewReport(e)}>
            Create a New Report
          </button>
          <div className="report-list">
            <ul>
              {reportLinks}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

ReportList.propTypes = {
  history: PropTypes.object.isRequired,
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string.isRequired,
      report_type: PropTypes.string,
      isRunning: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  highlightId: PropTypes.number,
  onClearReportConfiguration: PropTypes.func.isRequired,
};
