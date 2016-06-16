import React from 'react';
import {HelpText} from './HelpText';
import {
  Button,
  ButtonGroup,
  Col,
  FormControl,
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

export default class Inbox extends React.Component {
  render() {
    const {dispatch, inbox} = this.props;
    let buttons;
    if (inbox.pk) {
      if (inbox.email === inbox.originalEmail) {
        buttons = [
          <Button
            key={'delete-' + inbox.pk}
            onClick={() => dispatch(doDeleteInbox(inbox))}>
            Delete
          </Button>,
        ];
      } else {
        buttons = [
          <Button
            key={'update-' + inbox.pk}
            disabled={!inbox.valid}
            onClick={() => dispatch(doUpdateInbox(inbox))}>
            Update
          </Button>,
          <Button
            key={'cancel-' + inbox.pk}
            onClick={() => dispatch(resetInboxAction(inbox))}>
            Cancel
          </Button>,
        ];
      }
    } else {
      buttons = [
        <Button
          key={'add-' + inbox.pk}
          disabled={!inbox.valid}
          onClick={() => dispatch(doAddInbox(inbox))} >
          Add
        </Button>,
      ];
    }

    return (
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
                autoFocus={!inbox.pk}
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
