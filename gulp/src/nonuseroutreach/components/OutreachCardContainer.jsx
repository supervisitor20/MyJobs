import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import OutreachCard from 'nonuseroutreach/components/OutreachCard';
import {isEmpty, map, filter, get, any} from 'lodash-compat';
import {
  determineProcessStateAction,
  editPartnerAction,
  deletePartnerAction,
  editContactAction,
  deleteContactAction,
  editCommunicationRecordAction,
  deleteCommunicationRecordAction,
} from '../actions/process-outreach-actions';


class OutreachCardContainer extends Component {
  handlePartnerNav() {
    const {dispatch, partner} = this.props;

    if (!get(partner, 'pk.value')) {
      dispatch(editPartnerAction());
    }
  }

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
        (contact, i) => this.renderContact(contact, i));
    case 'partner':
      return this.renderPartner(stateObject);
    case 'communicationrecord':
      return this.renderCommunicationRecord(stateObject);
    default:
      break;
    }
  }

  hasErrors(record) {
    return any(record, v => !isEmpty(v.errors));
  }

  renderContact(contact, index) {
    const {dispatch} = this.props;

    return (
      <OutreachCard
        hasErrors={this.hasErrors(contact)}
        key={index}
        displayText={get(contact, 'name.value')}
        type="contact"
        onNav={() => dispatch(editContactAction(index))}
        onDel={() => {
          dispatch(deleteContactAction(index));
          dispatch(determineProcessStateAction());
        }} />
    );
  }

  renderPartner(partner) {
    const {dispatch} = this.props;

    return (
      <OutreachCard
        hasErrors={this.hasErrors(partner)}
        key="partner"
        type="partner"
        displayText={get(partner, 'name.value')}
        onNav={() => this.handlePartnerNav()}
        onDel={() => {
          dispatch(deletePartnerAction());
          dispatch(determineProcessStateAction());
        }} />
    );
  }

  renderCommunicationRecord() {
    const {dispatch, communicationrecord} = this.props;

    return (
      <OutreachCard
        hasErrors={this.hasErrors(communicationrecord)}
        displayText={get(communicationrecord, 'contact_type.value', 'unknown')}
        type="communicationrecord"
        onNav={() =>
          dispatch(editCommunicationRecordAction())}
        onDel={() => dispatch(deleteCommunicationRecordAction())}
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
