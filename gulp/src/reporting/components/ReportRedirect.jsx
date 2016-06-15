import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {
  doReportDataRedirect,
} from '../actions/compound-actions';


class ReportRedirect extends Component {
  componentDidMount() {
    const {dispatch, history} = this.props;

    dispatch(doReportDataRedirect(history));
  }

  render() {
    return <div/>;
  }
}

ReportRedirect.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};


export default connect()(ReportRedirect);
