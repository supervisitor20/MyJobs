import React from 'react';
import {Router, Route, IndexRedirect, hashHistory} from 'react-router';
import NonUserOutreachApp from './NonUserOutreachApp';
import OverviewPage from './OverviewPage';
import InboxManagementPage from './InboxManagementPage';
import OutreachRecordPage from './OutreachRecordPage.jsx';


export default class NonUserOutreachRouter extends React.Component {
  createElement(Component, componentProps) {
    const {api} = this.props;
    const newProps = {...componentProps, api};

    return <Component {...newProps} />;
  }
  render() {
    return (
      <Router createElement={(c, p) => this.createElement(c, p)}
              history={hashHistory}>
        <Route path="/" component={NonUserOutreachApp}>
          <IndexRedirect to="/overview" />
          <Route path="/overview" component={OverviewPage} />
          <Route path="/inboxes" component={InboxManagementPage} />
          <Router path="/records" component={OutreachRecordPage} />
        </Route>
      </Router>
    );
  }
}

NonUserOutreachRouter.propTypes = {
  api: React.PropTypes.object.isRequired,
};
