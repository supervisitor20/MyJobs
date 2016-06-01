import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import ReportList from './ReportList';
import {highlightReportAction} from './report-list-actions';

class DynamicReportApp extends Component {
  componentDidMount() {
    const {history} = this.props;
    this.unsubscribeToHistory = history.listen(
      (...args) => this.handleNewLocation(...args));
  }

  componentWillUnmount() {
    this.unsubscribeToHistory();
  }

  handleNewLocation(state, loc) {
    const {dispatch} = this.props;
    dispatch(highlightReportAction(Number.parseInt(loc.params.reportId, 10)));
  }

  render() {
    const {reportId} = this.props.params;
    const {history, reportFinder} = this.props;

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
          <div className="col-xs-12 col-md-4">
            <ReportList history={history}/>
          </div>
        </div>
      </div>
    );
  }
}

DynamicReportApp.propTypes = {
  history: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default connect(() => ({}))(DynamicReportApp);
