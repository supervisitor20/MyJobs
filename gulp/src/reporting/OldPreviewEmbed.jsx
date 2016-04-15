/* global renderGraphs */
import React, {PropTypes, Component} from 'react';
import warning from 'warning';


export default class OldPreviewEmbed extends Component {
  componentDidMount() {
    const {reportId, reportName} = this.props.params;
    renderGraphs(reportId, reportName);
  }

  render() {
    return <div id="main-container"/>;
  }
}

OldPreviewEmbed.propTypes = {
  params: PropTypes.shape({
    reportId: PropTypes.string.isRequired,
    reportName: PropTypes.string.isRequired,
  }).isRequired,
};

warning(typeof(renderGraphs) !== 'undefined',
  'Imported OldPreviewEmbed but can\'t find global renderGraphs. ' +
  'Did we forget to include reporting.js?');
