import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import OutreachCard from 'nonuseroutreach/components/OutreachCard';
import {isEmpty} from 'lodash-compat';

class OutreachCardContainer extends Component {
  propsToCards() {
    const cardsReturn = [];
    for (const key in this.props) {
      if (this.props.hasOwnProperty(key) && !isEmpty(this.props[key])) {
        cardsReturn.push(this.switchCards(this.props[key], key));
      }
    }
    return cardsReturn;
  }

  switchCards(stateObject, type) {
    switch (type) {
    case 'contacts':
      const contactsReturn = [];
      for (const contact in stateObject) {
        if (!isEmpty(contact)) {
          contactsReturn.push(this.handleContact(contact));
        }
      }
      return contactsReturn;
    case 'partner':
      return this.handlePartner(stateObject);
    case 'communicationrecord':
      return this.handleCommunicationRecord(stateObject);
    default:
      break;
    }
  }

  handleContact(contact) {
    return <OutreachCard displayText={contact} key={contact} />;
  }

  handlePartner(partner) {
    return <OutreachCard displayText={partner.partnername} key={partner.pk}/>;
  }

  handleCommunicationRecord(communicationRecord) {
    return (<OutreachCard displayText={communicationRecord}
                         key={communicationRecord} />);
  }

  render() {
    const outreachCards = this.propsToCards();
    return (
      <div>
        {outreachCards}
      </div>
    );
  }
}

OutreachCardContainer.propTypes = {
  partner: PropTypes.object.isRequired,
  contacts: PropTypes.array.isRequired,
};

export default connect(state => ({
  partner: state.process.record.partner,
  contacts: state.process.record.contacts,
  // communication record..
}))(OutreachCardContainer);
