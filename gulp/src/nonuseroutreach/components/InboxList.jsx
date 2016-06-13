import React, {Component, PropTypes} from 'react';

import {InboxRow} from './InboxRow';


/**
 * container for all edit rows of objects loaded from DB
 */
export class InboxList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inboxes: [],
    };
  }

  handleDelete(index) {
    this.props.api.deleteInbox(this.state.inboxes[index].pk);
    this.setState({
      inboxes: this.state.inboxes.filter((_, i) => i !== index),
    });
  }

  async loadInboxesFromApi() {
    const results = await this.props.api.getExistingInboxes();
    this.setState({
      inboxes: results,
    });
  }

  render() {
    const {inboxes} = this.state;
    if (inboxes.length === 0) {
      return (<div></div>);
    }

    return (
      <div className="cardWrapper">
        <div className="row">
          <div className="col-xs-12 ">
            <div className="wrapper-header">
              <h2>Existing Inbox Management</h2>
            </div>
            <div className="partner-holder no-highlight">
              {inboxes.map((inboxOb, i) =>
                <InboxRow
                  inbox={inboxOb}
                  key={inboxOb.pk}
                  index={i}
                  handleDelete={index => this.handleDelete(index)}
                  loadInboxesFromApi={() => this.loadInboxesFromApi()}
                  api={this.props.api} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

InboxList.propTypes = {
  api: PropTypes.object.isRequired,
};
