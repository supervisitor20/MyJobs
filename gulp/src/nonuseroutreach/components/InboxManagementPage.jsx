import React from 'react';
import {connect} from 'react-redux';

import InboxList from './InboxList';
import AddInboxForm from './AddInboxForm';


// inbox management app main page
class InboxManagementPage extends React.Component {
  render() {
    const {api, newInbox, inboxes} = this.props;
    return (
      <div className="card-wrapper">
        <AddInboxForm api={api} {...newInbox} />
        <InboxList api={api} inboxes={inboxes} />
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
  ...state.inboxManagement,
}))(InboxManagementPage);
