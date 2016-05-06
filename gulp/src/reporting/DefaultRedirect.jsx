import React, {PropTypes, Component} from 'react';
import {Loading} from 'common/ui/Loading';

export default class DefaultRedirect extends Component {
  componentDidMount() {
    const {reportFinder} = this.props;
    const {intention, category, dataSet} = this.props.location.query;
    reportFinder.buildReportConfiguration(
      intention, category, dataSet, null, {}, null,
      () => {},
      () => {},
      () => {},
      (...args) => this.handleNewReportDataId(...args));
  }

  handleNewReportDataId(newReportDataId, reportingType, reportType, dataType) {
    const {history} = this.props;

    const href = '/set-up-report';
    const query = {
      reportDataId: newReportDataId,
      intention: reportingType,
      category: reportType,
      dataSet: dataType,
    };
    history.replaceState(null, href, query);
  }

  render() {
    return <Loading/>;
  }
}

DefaultRedirect.propTypes = {
  history: PropTypes.object.isRequired,
  reportFinder: PropTypes.object.isRequired,
  location: PropTypes.shape({
    query: PropTypes.shape({
      intention: PropTypes.string,
      category: PropTypes.string,
      dataSet: PropTypes.string,
    }),
  }),
};
