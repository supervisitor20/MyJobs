import React from 'react';
import {connect} from 'react-redux';

import {InboxList} from './InboxList';
import AddInboxForm from './AddInboxForm';


// inbox management app main page
class InboxManagementPage extends React.Component {
  render() {
    const {api, newInbox} = this.props;
    return (
      <div>
        <InboxList api={api} />
        <div className="card-wrapper">
          <div className="row">
            <div className="col-xs-12 ">
              <div className="wrapper-header">
                <h2>Add New Inbox</h2>
              </div>
              <div className="partner-holder no-highlight">
                <div className="product-card no-highlight clearfix">
                  <AddInboxForm api={api} {...newInbox} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

InboxManagementPage.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  api: React.PropTypes.object.isRequired,
  inboxes: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      pk: React.PropTypes.number.isRequired,
      email: React.PropTypes.string.isRequired,
    })
  ),
  newInbox: React.PropTypes.shape({
    email: React.PropTypes.string.isRequired,
    errors: React.PropTypes.arrayOf(React.PropTypes.string.isRequired),
    isValid: React.PropTypes.bool.isRequired,
  }),
};

export default connect(state => ({
  // todo .. shorthand syntax
  inboxes: state.inboxes,
  newInbox: state.newInbox,
}))(InboxManagementPage);
