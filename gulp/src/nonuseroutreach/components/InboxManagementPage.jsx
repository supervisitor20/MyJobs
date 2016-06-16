import React from 'react';
import {connect} from 'react-redux';
import {doGetInboxes} from '../actions/inbox-actions';
import {setPageAction} from '../actions/navigation-actions';
import Inbox from './Inbox';
import {Col, Row} from 'react-bootstrap';

class InboxManagementPage extends React.Component {
  componentWillMount() {
    const {dispatch} = this.props;
    dispatch(setPageAction('inboxes'));
    dispatch(doGetInboxes());
  }

  render() {
    const {dispatch, inboxes} = this.props;

    return (
      <div className="cardWrapper">
        <Row>
          <Col xs={12}>
            <div className="wrapper-header">
              <h2>Non-User Outreach Inboxes</h2>
            </div>
            {inboxes.map(inbox =>
              <div
                key={'inbox-' + inbox.pk}
                className="product-card no-highlight clearfix">
                <Row>
                  <Col xs={12}>
                    <Inbox dispatch={dispatch} inbox={inbox} />
                  </Col>
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

InboxManagementPage.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  inboxes: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      pk: React.PropTypes.number,
      email: React.PropTypes.string.isRequired,
      errors: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
      valid: React.PropTypes.bool.isRequired,
    }).isRequired,
  ),
};

export default connect(state => ({
  inboxes: state.inboxes,
}))(InboxManagementPage);
