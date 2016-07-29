import React, {Component, PropTypes} from 'react';
import {Col, Row} from 'react-bootstrap';
import {connect} from 'react-redux';
import {Loading} from 'common/ui/Loading';
import Menu from './Menu';
import InboxManagementPage from './InboxManagementPage';
import OutreachRecordPage from './OutreachRecordPage';
import {markPageLoadingAction} from 'common/actions/loading-actions';
import {doGetInboxes} from '../actions/inbox-actions';
import {doGetRecords} from '../actions/record-actions';
import {setPageAction, doGetWorkflowStateChoices} from '../actions/navigation-actions';

/* NonUserOutreachApp
 * An app for managing nonuser outreach, providing a sidebar for navigation and
 * a content area which displays either an overview, inbox management, or
 * outreach record management page.
 */
class NonUserOutreachApp extends Component {
  componentDidMount() {
    const {history, dispatch} = this.props;
    dispatch(doGetWorkflowStateChoices());
    this.unsubscribeToHistory = history.listen(
      (...args) => this.handleNewLocation(...args));
  }

  componentWillUnmount() {
    this.unsubscribeToHistory();
  }

  async handleNewLocation(_, loc) {
    const {dispatch} = this.props;

    const lastComponent = loc.components[loc.components.length - 1];
    if (lastComponent === InboxManagementPage) {
      // update the application's state with the current page and refresh the
      // list of inboxes
      dispatch(setPageAction('inboxes'));
      dispatch(markPageLoadingAction(true));
      await dispatch(doGetInboxes());
      dispatch(markPageLoadingAction(false));
      return;
    } else if (lastComponent === OutreachRecordPage) {
      // update the application's state with the current page and refresh the
      // list of outreach records
      dispatch(setPageAction('records'));
      dispatch(markPageLoadingAction(true));
      await dispatch(doGetRecords());
      dispatch(markPageLoadingAction(false));
      return;
    }


    // Allow other pages to mount.
    dispatch(markPageLoadingAction(false));
  }

  render() {
    const {loading, tips} = this.props;
    return (
      <div>
        <Row>
          <Col sm={12}>
            <div className="breadcrumbs">
              <span>
                Non-User Outreach
              </span>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={8}>
            {loading ? <Loading /> : this.props.children}
          </Col>
          <Col xs={12} md={4}>
            <Menu tips={tips} history={history} />
          </Col>
        </Row>
      </div>
    );
  }
}

NonUserOutreachApp.propTypes = {
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  // whether or not to show a page loading indicator in the content area
  loading: PropTypes.bool.isRequired,
  // the tips to pass along to the menu component
  tips: React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired,
  // which page to show in the content area
  children: PropTypes.node,
};

export default connect(state => ({
  loading: state.loading.mainPage,
  tips: state.navigation.tips,
}))(NonUserOutreachApp);
