import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {
  doReportDataRedirect,
} from '../actions/compound-actions';


/**
 * If the user lands on this page they are here to be redirected to a valid
 * set-up-report url. Their previous selection, if any, should be reflected in
 * the query string.
 *
 * The redirect will correct the query string if needed and fill in a valid
 * reportDataId.
 */
class ReportRedirect extends Component {
  componentDidMount() {
    const {dispatch, history} = this.props;
    const {intention, category, dataSet} = this.props.location.query;

    dispatch(doReportDataRedirect(history, intention, category, dataSet));
  }

  render() {
    return <div/>;
  }
}

ReportRedirect.propTypes = {
  dispatch: PropTypes.func.isRequired,
  // history under react router. used to navigate.
  history: PropTypes.object.isRequired,
  // from route
  location: PropTypes.shape({
    // from query string: these reference the current choice of the report
    // select menu. They are optional since the purpose of this component
    // is to fill them in if needed.
    query: PropTypes.shape({
      // intention/reporting type if previously selected
      intention: PropTypes.string,
      // category/report type if previously selected
      category: PropTypes.string,
      // data type if previously selected
      dataSet: PropTypes.string,
    }).isRequired,
  }).isRequired,
};


export default connect()(ReportRedirect);
