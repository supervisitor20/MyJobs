import React, {Component, PropTypes} from 'react';
import {Router, Route, IndexRedirect} from 'react-router';
import DynamicReportApp from './DynamicReportApp';
import SetUpReport from './SetUpReport';
import ExportReport from './ExportReport';
import OldPreviewEmbedPage from './OldPreviewEmbedPage';

export default class ReportingRouter extends Component {
  createElement(TheComponent, componentProps) {
    const {reportFinder} = this.props;
    const newProps = {...componentProps, reportFinder};

    return <TheComponent {...newProps}/>;
  }

  render() {
    return (
      <Router createElement={(c, p) => this.createElement(c, p)}>
        <Route path="/" component={DynamicReportApp}>
          <IndexRedirect to="/set-up-report"/>
          <Route
            path="set-up-report"
            component={SetUpReport}/>
          <Route
            path="export/:reportId"
            component={ExportReport}/>
          <Route
            path="preview/:reportId"
            component={OldPreviewEmbedPage}/>
        </Route>
      </Router>
    );
  }
}

ReportingRouter.propTypes = {
  reportFinder: PropTypes.object.isRequired,
};
