import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import OutreachCard from 'nonuseroutreach/components/OutreachCard';
import {isEmpty, map, filter} from 'lodash-compat';
import {
  editPartnerAction,
  editContactAction,
} from '../actions/process-outreach-actions';


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
      return map(filter(stateObject, c => !isEmpty(c)),
        (contact, i) => this.handleContact(contact, i));
    case 'partner':
      return this.handlePartner(stateObject);
    case 'communicationrecord':
      return this.handleCommunicationRecord(stateObject);
    default:
      break;
    }
  }

  handleContact(contact, index) {
    const {dispatch} = this.props;

    return (
      <OutreachCard
        key={index}
        displayText={contact.name}
        type="contact"
        onNav={() => dispatch(editContactAction(index))}/>
    );
  }

  handlePartner(partner) {
    const {dispatch} = this.props;

    return (
      <OutreachCard
        key="partner"
        type="partner"
        displayText={partner.partnername}
        onNav={() => dispatch(editPartnerAction())}/>
    );
  }

  handleCommunicationRecord(communicationRecord) {
    return (<OutreachCard displayText={communicationRecord}
                          type="communicationrecord"
                          key="commrec" />);
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
  dispatch: PropTypes.func.isRequired,
  partner: PropTypes.object.isRequired,
  contacts: PropTypes.array.isRequired,
};

export default connect(state => ({
  partner: state.process.record.partner,
  contacts: state.process.record.contacts,
  // communication record..
}))(OutreachCardContainer);
