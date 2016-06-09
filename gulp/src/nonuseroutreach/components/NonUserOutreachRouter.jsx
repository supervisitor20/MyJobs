import React from 'react';
import {Router, Route, hashHistory} from 'react-router';
import InboxManagementPage from './InboxManagementPage';
import OutreachRecordPage from './OutreachRecordPage.jsx';
import NonUserOutreachApp from './NonUserOutreachApp';


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
        <Route
          path="/"
          component={NonUserOutreachApp} />
        <Route
          path="/inboxes"
          component={InboxManagementPage} />
        <Router
          path="/records"
          component={OutreachRecordPage} />
      </Router>
    );
  }
}

NonUserOutreachRouter.propTypes = {
  api: React.PropTypes.object.isRequired,
};
