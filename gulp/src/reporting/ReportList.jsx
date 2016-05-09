import React, {PropTypes, Component} from 'react';
import {map} from 'lodash-compat';
import PopMenu from 'common/ui/PopMenu';
import classnames from 'classnames';

export class ReportList extends Component {
  constructor() {
    super();
    this.state = {
      isMenuActive: false,
      currentlyActive: '',
    };
  }

  toggleMenu(e) {
    const {isMenuActive} = this.state;
    this.setState({isMenuActive: !isMenuActive, currentlyActive: e.target.parentNode.parentNode.id});
  }

  handlePreviewReport(report) {
    const {history} = this.props;
    const href = '/preview/' + report.id;
    const query = {
      reportName: report.name,
      reportType: report.report_type,
    };
    this.closeAllPopups();
    history.pushState(null, href, query);
  }

  handleExportReport(report) {
    const {history} = this.props;
    const href = '/export/' + report.id;
    this.closeAllPopups();
    history.pushState(null, href);
  }

  closeAllPopups() {
    this.setState({isMenuActive: false, currentlyActive: ''});
  }

  render() {
    const {reports, highlightId} = this.props;
    const {currentlyActive} = this.state;
    const reportLinks = map(reports, r => {
      const options = [];
      const numberedID = 'listentry' + r.id;
      let isThisMenuActive = false;
      if (numberedID === currentlyActive) {
        isThisMenuActive = true;
      }
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
          className={classnames(
            highlightId === r.id ? 'active' : '',
            numberedID === currentlyActive ? 'active-parent' : '',
          )}
          key={r.id}
          id={numberedID}>
          {options.length > 0 ? <PopMenu options={options} isMenuActive={isThisMenuActive} toggleMenu={(e) => this.toggleMenu(e)} closeAllPopups={(e) => this.closeAllPopups(e)} /> : ''}
          {r.isRunning ? <span className="report-loader"></span> : ''}
          <span className="menu-text">{r.name}</span>
        </li>
      );
    });

    return (
      <div>
        <div className="sidebar reporting">
          <h2 className="top">Saved Reports</h2>
          <a
            className="button primary wide"
            href="#/set-up-report">
            Create a New Report
          </a>
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
};
