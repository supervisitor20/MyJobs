import React from 'react';
import {connect} from 'react-redux';
import {Col, Row} from 'react-bootstrap';
import OutreachRecordTable from './OutreachRecordTable';
import {markPageLoadingAction} from '../../common/actions/loading-actions';
import {doGetRecords} from '../actions/record-actions';
import {setPageAction} from '../actions/navigation-actions';

/* OutreachRecordPage
 * Component which encapsulates the OutreachRecordTable.
 * Note: While we currently only display a table here, it is intended that this
 * interface will grow to be something more elaborate - Edwin, 6/17/2016
 */
class OutreachRecordPage extends React.Component {
  async componentDidMount() {
    // update the application's state with the current page and refresh the
    // list of outreach records
    const {dispatch} = this.props;
    dispatch(setPageAction('records'));
    dispatch(markPageLoadingAction(true));
    await dispatch(doGetRecords());
    dispatch(markPageLoadingAction(false));
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
  // records are of the shape documented in OutreachRecordTable
  records: React.PropTypes.arrayOf(
    React.PropTypes.object.isRequired,
  ).isRequired,
};

export default connect(state => ({
  records: state.records,
}))(OutreachRecordPage);
