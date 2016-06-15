import React from 'react';
import {connect} from 'react-redux';
import {HelpText} from './HelpText';
import {
  Button,
  ButtonGroup,
  Col,
  FormControl,
  Grid,
  InputGroup,
  Row,
} from 'react-bootstrap';

import {
  validateInboxAction,
  resetInboxAction,
  doUpdateInbox,
  doAddInbox,
  doDeleteInbox,
} from '../actions/inbox-actions';

class Inbox extends React.Component {
  render() {
    const {dispatch, inbox} = this.props;
    let buttons;
    if (inbox.pk) {
      if (inbox.email === inbox.originalEmail) {
        buttons = [
          <Button
            onClick={() => dispatch(doDeleteInbox(inbox))}>
            Delete
          </Button>,
        ];
      } else {
        buttons = [
          <Button
            disabled={!inbox.valid}
            onClick={() => dispatch(doUpdateInbox(inbox))}>
            Update
          </Button>,
          <Button
            onClick={() => dispatch(resetInboxAction(inbox))}>
            Cancel
          </Button>,
        ];
      }
    } else {
      buttons = [
        <Button
          disabled={!inbox.valid}
          onClick={() => dispatch(doAddInbox(inbox))} >
          Add
        </Button>,
      ];
    }

    return (
      <Grid>
        <Row>
          <Col md={8} xs={12}>
            {/* begin component */}
            <div className="product-card no-highlight clearfix">
              {inbox.errors.map((error, index) =>
                <HelpText key={index} message={error} />)}
              <Row>
                <Col md={8} xs={12}>
                  <InputGroup>
                    <FormControl
                      type="text"
                      className="email-input"
                      value={inbox.email}
                      ref="email_input"
                      autoFocus
                      onChange={e => dispatch(validateInboxAction({
                        ...inbox,
                        email: e.target.value,
                      }))}/>
                    <InputGroup.Addon>@my.jobs</InputGroup.Addon>
                  </InputGroup>
                </Col>
                <Col md={4} xs={12}>
                  <ButtonGroup className="pull-right">
                    {buttons}
                  </ButtonGroup>
                </Col>
              </Row>
            </div>
            {/* end component */}
          </Col>
        </Row>
      </Grid>
    );
  }
}

Inbox.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  inbox: React.PropTypes.shape({
    pk: React.PropTypes.number,
    email: React.PropTypes.string.isRequired,
    errors: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    valid: React.PropTypes.bool.isRequired,
  }).isRequired,
};

export default connect( state => ({
  inbox: state.inboxManagement.newInboxes[0],
}))(Inbox);
