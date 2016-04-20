import React, {Component, PropTypes} from 'react';
import {Router, Route, IndexRedirect} from 'react-router';
import {DynamicReportApp} from 'reporting/DynamicReportApp';
import SetUpReport from 'reporting/SetUpReport';
import ExportReport from 'reporting/ExportReport';

export class WizardRouter extends Component {
  createElement(TheComponent, componentProps) {
    const {reportFinder} = this.props;
    const newProps = {...componentProps, reportFinder};

    return <TheComponent {...newProps}/>;
  }

  render() {
    return (
      <Router createElement={(c, p) => this.createElement(c, p)}>
        <Route path="/" component={DynamicReportApp}>
          <IndexRedirect to="set-up-report"/>
          <Route
            path="set-up-report"
            component={SetUpReport}/>
          <Route
            path="export/:reportId"
            component={ExportReport}/>
        </Route>
      </Router>
    );
  }
}

WizardRouter.propTypes = {
  reportFinder: PropTypes.object.isRequired,
};
