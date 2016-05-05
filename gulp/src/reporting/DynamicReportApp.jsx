import React, {PropTypes, Component} from 'react';
import {ReportList} from './ReportList';
import {remove} from 'lodash-compat/array';
import {map} from 'lodash-compat/collection';

export class DynamicReportApp extends Component {
  constructor() {
    super();
    this.state = {
      completedReportList: [],
      runningReportList: [],
    };
  }

  componentDidMount() {
    const {reportFinder} = this.props;
    this.callbackRef =
      reportFinder.subscribeToNewReports(
          (reportId, runningReport) =>
            this.handleNewReport(reportId, runningReport),
          runningReport => this.handleRunningReport(runningReport));
    this.handleNewReport(null, null);
  }

  componentWillUnmount() {
    const {reportFinder} = this.props;
    reportFinder.unsubscribeToReportList(this.callbackRef);
  }

  async handleNewReport(reportId, runningReport) {
    const {reportFinder} = this.props;
    const {runningReportList} = this.state;
    const completedReportList = await reportFinder.getReportList();

    remove(runningReportList, i => i === runningReport);

    this.setState({
      ...this.state,
      runningReportList,
      completedReportList,
    });
  }

  async handleRunningReport(runningReport) {
    const {runningReportList} = this.state;
    runningReportList.unshift(runningReport);
    this.setState({runningReportList});
  }

  render() {
    const {completedReportList, runningReportList} = this.state;
    const {reportId} = this.props.params;
    const {history} = this.props;

    const reportList = map(runningReportList,
        r => ({...r, isRunning: true})).concat(
        map(completedReportList,
          r => ({...r, isRunning: false})));

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
            {this.props.children}
          </div>
          <div className="col-xs-6 col-md-4">
            <ReportList
              history={history}
              reports={reportList}
              highlightId={Number.parseInt(reportId, 10)}/>
          </div>
        </div>
      </div>
    );
  }
}

DynamicReportApp.propTypes = {
  history: PropTypes.object.isRequired,
  reportFinder: PropTypes.object.isRequired,
  children: PropTypes.node,
  params: PropTypes.shape({
    reportId: PropTypes.any,
  }).isRequired,
};
