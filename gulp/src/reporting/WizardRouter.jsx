import React, {Component, PropTypes} from 'react';
import {Router, Route, IndexRedirect} from 'react-router';
import {DynamicReportApp} from 'reporting/DynamicReportApp';
import {WizardPageReportingTypes} from './wizard/WizardPageReportingTypes';
import {WizardPageReportTypes} from './wizard/WizardPageReportTypes';
import {WizardPageDataTypes} from './wizard/WizardPageDataTypes';
import {WizardPageFilter} from './wizard/WizardPageFilter';
import {
  WizardPagePresentationTypes,
} from './wizard/WizardPagePresentationTypes';

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
          <IndexRedirect to="reporting-types"/>
          <Route
            path="reporting-types"
            component={WizardPageReportingTypes}/>
          <Route
            path="report-types/:reportingType"
            component={WizardPageReportTypes}/>
          <Route
            path="data-types/:reportType"
            component={WizardPageDataTypes}/>
          <Route
            path="presentation-types/:reportType/:dataType"
            component={WizardPagePresentationTypes}/>
          <Route
            path="set-up-report/:presentationType"
            component={WizardPageFilter}/>
        </Route>
      </Router>
    );
  }
}

WizardRouter.propTypes = {
  reportFinder: PropTypes.object.isRequired,
};
