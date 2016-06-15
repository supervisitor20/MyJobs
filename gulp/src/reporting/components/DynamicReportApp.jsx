import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {Loading} from 'common/ui/Loading';
import ReportList from './ReportList';
import ReportRedirect from './ReportRedirect';
import SetUpReport from './SetUpReport';
import {highlightReportAction} from '../actions/report-list-actions';
import {
  markPageLoadingAction,
} from 'common/actions/loading-actions';
import {
  doLoadReportSetUp,
  doDataSetMenuFill,
} from '../actions/compound-actions';


class DynamicReportApp extends Component {
  componentDidMount() {
    const {history} = this.props;
    this.unsubscribeToHistory = history.listen(
      (...args) => this.handleNewLocation(...args));
  }

  componentWillUnmount() {
    this.unsubscribeToHistory();
  }

  async handleNewLocation(_, loc) {
    const {dispatch} = this.props;

    dispatch(highlightReportAction(Number.parseInt(loc.params.reportId, 10)));

    const lastComponent = loc.components[loc.components.length - 1];
    if (lastComponent === SetUpReport) {
      const {
        intention,
        category,
        dataSet,
        reportDataId: reportDataIdString,
      } = loc.location.query || {};
      const reportDataId = Number.parseInt(reportDataIdString, 10);
      const {currentFilter, name} = loc.location.state || {};
      await dispatch(doDataSetMenuFill(intention, category, dataSet));
      await dispatch(doLoadReportSetUp(reportDataId, currentFilter, name));
    }

    // Allow redirect to mount.
    if (lastComponent === ReportRedirect) {
      dispatch(markPageLoadingAction(false));
    }
  }

  render() {
    const {history, pageLoading} = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-sm-12">
            <div className="breadcrumbs">
              <span>
                Dynamic Reporting (beta)
              </span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-8">
            {pageLoading ?
              <Loading/> :
              this.props.children}
          </div>
          <div className="col-xs-12 col-md-4">
            <ReportList history={history}/>
          </div>
        </div>
      </div>
    );
  }
}

DynamicReportApp.propTypes = {
  pageLoading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default connect(s => ({
  pageLoading: s.loading.mainPage,
}))(DynamicReportApp);
