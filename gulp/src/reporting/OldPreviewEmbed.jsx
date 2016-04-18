/* global renderGraphs, renderViewContact, renderViewPartner */
import React, {PropTypes, Component} from 'react';
import warning from 'warning';
import {isEqual} from 'lodash-compat/lang';


export default class OldPreviewEmbed extends Component {
  componentDidMount() {
    this.runJQueryRender();
  }

  shouldComponentUpdate(newProps) {
    const shouldUpdate =
      !isEqual(this.getPropComparison(this.props),
        this.getPropComparison(newProps));
    return shouldUpdate;
  }

  componentDidUpdate() {
    this.runJQueryRender();
  }

  getPropComparison(props) {
    return {
      reportId: props.reportId,
      reportName: props.reportName,
      reportType: props.reportType,
    };
  }

  runJQueryRender() {
    const {reportId, reportName, reportType, onLoading} = this.props;
    const oldPreviewUrl = '/reports/api/old_report_preview';

    if (reportType === 'communication-records') {
      onLoading(true);
      renderGraphs(
        reportId,
        reportName,
        () => {onLoading(false);},
        oldPreviewUrl);
    } else if (reportType === 'contacts') {
      renderViewContact(reportId, reportName, oldPreviewUrl);
      onLoading(false);
    } else if (reportType === 'partners') {
      renderViewPartner(reportId, reportName, oldPreviewUrl);
      onLoading(false);
    }
  }

  render() {
    return (
      <div>
        <div id="main-container"/>
      </div>
    );
  }
}

OldPreviewEmbed.propTypes = {
  /**
   * Name of the report being previewed
   */
  reportName: PropTypes.string.isRequired,
  /**
   * Report type being previewed.
   */
  reportType: PropTypes.string.isRequired,
  /**
   * Id of report being previewed.
   */
  reportId: PropTypes.string.isRequired,
  /**
   * Called when the loading state of the previewed report changes.
   * This is only used for communication record reports.
   */
  onLoading: PropTypes.func.isRequired,
};

warning(typeof(renderGraphs) !== 'undefined',
  'Imported OldPreviewEmbed but can\'t find global renderGraphs. ' +
  'Did we forget to include reporting.js?');

// Disable the old reporting history mechanism.
window.onpopstate = () => {};
