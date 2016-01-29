import React, {PropTypes, Component} from 'react';
import {ReportList} from './ReportList';

// Props for this component come directly from the store state. (see main.js).
export class DynamicReportApp extends Component {
  constructor() {
    super();
    this.state = {reportList: []};
  }

  componentDidMount() {
    const {reportFinder} = this.props;
    this.callbackRef =
      reportFinder.subscribeToReportList(() => this.refreshReportList());
    this.refreshReportList();
  }

  componentWillUnmount() {
    const {reportFinder} = this.props;
    reportFinder.unsubscribeToReportList(this.callbackRef);
  }

  async refreshReportList() {
    const {reportFinder} = this.props;
    const reportList = await reportFinder.getReportList();

    this.setState({
      ...this.state,
      reportList: reportList,
    });
  }

  render() {
    const {reportList} = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="span8 panel">
            {this.props.children}
          </div>
          <div className="span4">
            <ReportList reports={reportList}/>
          </div>
        </div>
      </div>
    );
  }
}

DynamicReportApp.propTypes = {
  reportFinder: PropTypes.object.isRequired,
  children: PropTypes.node,
};
