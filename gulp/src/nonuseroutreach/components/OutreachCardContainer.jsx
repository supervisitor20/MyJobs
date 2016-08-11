import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import OutreachCard from 'nonuseroutreach/components/OutreachCard'

class OutreachCardContainer extends Component {
  propsToCards() {
    let cardsReturn = []
    for (let key in this.props) {
      if (this.props.hasOwnProperty(key)) {
          cardsReturn.push(this.switchCards(this.props[key], key));
      }
    }
    return cardsReturn;
  }

  switchCards(stateObject, type) {
    switch (type) {
      case 'contacts':
        let contactsReturn = [];
        for (let contact in stateObject) {
          if (typeof contact === 'object') {
            console.log('cnt')
            contactsReturn.push(this.handleContact(contact));
          }
        }
        return contactsReturn;
        break;
      case 'partner':
        if (typeof stateObject === 'object') {
          console.log('prt')
          return this.handlePartner(stateObject);
        }
        break;
      case 'communicationrecord':
        if (typeof stateObject === 'object') {
          console.log('cmrec')
          return this.handleCommunicationRecord(stateObject)
        }
        break;
    }
  }

  handleContact(contact) {
    return <OutreachCard displayText={contact.name} />;
  }

  handlePartner(partner) {
    return <OutreachCard displayText={partner.partnername} />;
  }

  handleCommunicationRecord(communicationRecord) {
    return false;
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

};

export default connect(state => ({
  partner: state.process.record.partner,
  contacts: state.process.record.contacts,
  // communication record..
}))(OutreachCardContainer);
