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

  componentDidMount() {
    this.loadInboxesFromApi();
  }

  handleDelete(index) {
    this.setState({
      inboxes: this.state.inboxes.filter((_, i) => i !== index),
    });
  }

  async loadInboxesFromApi() {
    const results = await this.props.inboxManager.getExistingInboxes();
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
      <div className="col-xs-12 ">
        <div className="wrapper-header">
          <h2>Existing Inbox Management</h2>
        </div>
        <div className="partner-holder">
          {inboxes.map((inboxOb, i) =>
            <InboxRow
              inbox={inboxOb}
              key={inboxOb.pk}
              index={i}
              handleDelete={index => this.handleDelete(index)}
              loadInboxesFromApi={() => this.loadInboxesFromApi()}
              inboxManager={this.props.inboxManager} />
          )}
        </div>
      </div>
    );
  }
}

InboxList.propTypes = {
  inboxManager: PropTypes.object.isRequired,
};
