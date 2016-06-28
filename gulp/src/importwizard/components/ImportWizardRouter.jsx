import React from 'react';
import {IndexRedirect, Route, Router, hashHistory} from 'react-router';
import ImportWizardApp from './ImportWizardApp';
import ImportOptionsPage from './ImportOptionsPage';

export default class ImportWizardRouter extends React.Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={ImportWizardApp}>
          <IndexRedirect to="/options" />
          <Route path="/options" component={ImportOptionsPage} />
        </Route>
      </Router>
    );
  }
}
