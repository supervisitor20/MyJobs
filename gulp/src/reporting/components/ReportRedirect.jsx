import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {
  doReportDataRedirect,
} from '../actions/compound-actions';


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
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({
    query: PropTypes.shape({
      intention: PropTypes.string,
      category: PropTypes.string,
      dataSet: PropTypes.string,
    }).isRequired,
  }).isRequired,
};


export default connect()(ReportRedirect);
