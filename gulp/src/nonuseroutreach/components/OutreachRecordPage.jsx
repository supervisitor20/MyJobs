import React from 'react';
import {connect} from 'react-redux';
import {Col, Row} from 'react-bootstrap';
import OutreachRecordTable from './OutreachRecordTable';
import {doGetRecords} from '../actions/record-actions';

// outreach record table view
class OutreachRecordPage extends React.Component {
  componentWillMount() {
    const {dispatch} = this.props;
    dispatch(doGetRecords());
  }

  render() {
    const {records} = this.props;
    return (
      <Row>
        <Col xs={12}>
          <OutreachRecordTable records={records} />
        </Col>
      </Row>
    );
  }
}

OutreachRecordPage.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  records: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      dateAdded: React.PropTypes.string.isRequired,
      outreachEmail: React.PropTypes.string.isRequired,
      fromEmail: React.PropTypes.string.isRequired,
      currentWorkflowState: React.PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
};

export default connect(state => ({
  ...state.recordManagement,
}))(OutreachRecordPage);
