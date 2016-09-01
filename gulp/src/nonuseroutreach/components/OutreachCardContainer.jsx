import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import OutreachCard from 'nonuseroutreach/components/OutreachCard';
import {isEmpty, map, filter, get} from 'lodash-compat';
import {
  determineProcessStateAction,
  editPartnerAction,
  deletePartnerAction,
  editContactAction,
  deleteContactAction,
  editCommunicationRecordAction,
  deleteCommunicationRecordAction,
  cleanUpNewTags,
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
        displayText={get(contact, 'name.value')}
        type="contact"
        onNav={() => dispatch(editContactAction(index))}
        onDel={() => {
          dispatch(deleteContactAction(index));
          dispatch(cleanUpNewTags('contact' + index));
          dispatch(determineProcessStateAction());
        }} />
    );
  }

  handlePartner(partner) {
    const {dispatch} = this.props;

    return (
      <OutreachCard
        key="partner"
        type="partner"
        displayText={get(partner, 'name.value')}
        onNav={() => dispatch(editPartnerAction())}
        onDel={() => {
          dispatch(deletePartnerAction());
          dispatch(cleanUpNewTags('partner'));
          dispatch(determineProcessStateAction());
        }} />
    );
  }

  handleCommunicationRecord() {
    const {dispatch, communicationrecord} = this.props;

    return (
      <OutreachCard
        displayText={get(communicationrecord, 'contact_type.value', 'unknown')}
        type="communicationrecord"
        onNav={() =>
          dispatch(editCommunicationRecordAction())}
        onDel={() => {
          dispatch(deleteCommunicationRecordAction());
          dispatch(cleanUpNewTags('communicationrecord'));
        }
        }
        key="commrec" />
    );
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

OutreachCardContainer.defaultProps = {
  contacts: [],
};

OutreachCardContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  partner: PropTypes.object,
  contacts: PropTypes.array,
  communicationrecord: PropTypes.object,
};

export default connect(state => ({
  partner: state.process.record.partner,
  contacts: state.process.record.contacts,
  communicationrecord: state.process.record.communicationrecord,
}))(OutreachCardContainer);
