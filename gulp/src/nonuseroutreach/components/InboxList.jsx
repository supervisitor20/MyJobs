import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {EmailInput} from './EmailInput';
import Button from 'react-bootstrap/lib/Button';
import {
  doGetInboxes,
  modifyInboxAction,
  resetInboxAction,
} from '../actions/inbox-actions';


/**
 * container for all edit rows of objects loaded from DB
 */
class InboxList extends Component {
  componentWillMount() {
    const {dispatch} = this.props;
    dispatch(doGetInboxes());
  }

  render() {
    const {dispatch, inboxes, modifiedInboxes} = this.props;
    const mergedInboxes =
      inboxes.map(i => modifiedInboxes.find(m => m.pk === i.pk) || i);
    return (
      inboxes.length ?
        <div className="cardWrapper">
          <div className="row">
            <div className="col-xs-12 ">
              <div className="wrapper-header">
                <h2>Existing Inbox Management</h2>
              </div>
              {mergedInboxes.map((inbox, i) =>
                <div className="product-card no-highlight clearfix ">
                  <div className="row">
                    <div className="col-xs-12">
                      <EmailInput
                        email={inbox.email}
                        onChange={v =>
                          dispatch(modifyInboxAction(inbox, v))}
                        id={i} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-xs-12">
                      {modifiedInboxes.indexOf(inbox) > -1 ?
                        <div>
                          <Button
                            className="primary pull-right">
                            Update
                          </Button>
                          <Button
                            className="pull-right"
                            onClick={() => dispatch(resetInboxAction(inbox))}>
                            Cancel
                          </Button>
                        </div> :
                        <Button
                          className="primary pull-right">
                          Delete
                        </Button>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      : <div></div>
    );
  }
}

InboxList.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  api: PropTypes.object.isRequired,
  inboxes: PropTypes.arrayOf(React.PropTypes.shape({
    pk: React.PropTypes.number.isRequired,
    email: React.PropTypes.string.isRequired,
  })),
  modifiedInboxes: React.PropTypes.shape({
    email: React.PropTypes.string.isRequired,
    errors: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
    isValid: React.PropTypes.bool.isRequired,
  }),
};

export default connect(state => ({
  inboxes: state.inboxManagement.inboxes,
  modifiedInboxes: state.inboxManagement.modifiedInboxes,
}))(InboxList);
