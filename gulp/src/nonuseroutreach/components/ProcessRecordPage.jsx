import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import FieldWrapper from 'common/ui/FieldWrapper';
import Card from './Card';
import Form from './Form';
import SearchDrop from './SearchDrop';
import {get} from 'lodash-compat/object';

import {
  partnerForm,
  contactForm,
  communicationRecordForm,
} from 'nonuseroutreach/forms';

import {
  choosePartnerAction,
  chooseContactAction,
  newPartnerAction,
  newContactAction,
  savePartnerAction,
  saveContactAction,
  editFormAction,
  doSubmit,
} from '../actions/process-outreach-actions';

class ProcessRecordPage extends Component {
  handleChoosePartner(obj) {
    const {dispatch} = this.props;

    dispatch(choosePartnerAction(obj.value, obj.display));
  }

  async handleChooseContact(obj) {
    const {dispatch} = this.props;

    dispatch(chooseContactAction(obj.value, obj.display));
  }

  async handleNewPartner(obj) {
    const {dispatch} = this.props;

    dispatch(newPartnerAction(obj.display));
  }

  async handleNewContact(obj) {
    const {dispatch} = this.props;

    dispatch(newContactAction(obj.display));
  }

  renderCard(title, children) {
    return (
      <Card title={title}>
        {children}
      </Card>
    );
  }

  renderInitialSearch() {
    return this.renderCard('Partner Data', ([
      <div key="partner" className="product-card no-highlight clearfix">
        <FieldWrapper label="Partner Organization">
          <SearchDrop
            instance="PARTNER"
            onAdd={obj => this.handleNewPartner(obj)}
            onSelect={obj => this.handleChoosePartner(obj)}/>
        </FieldWrapper>
      </div>,
      <div key="contact" className="product-card no-highlight clearfix">
        <FieldWrapper label="Contact Search">
          <SearchDrop
            instance="CONTACT"
            onSelect={obj => this.handleChooseContact(obj)}/>
        </FieldWrapper>
      </div>,
    ]));
  }

  renderSelectContact() {
    const {partnerId} = this.props;

    return this.renderCard('Add Contact', ([
      <div key="contact" className="product-card no-highlight clearfix">
        <FieldWrapper label="Contact Search">
          <SearchDrop
            instance="CONTACT"
            extraParams={{partner_id: partnerId}}
            onSelect={obj => this.handleChooseContact(obj)}
            onAdd={obj => this.handleNewContact(obj)}
            />
        </FieldWrapper>
      </div>,
    ]));
  }

  renderNewCommunicationRecord() {
    const {
      dispatch,
      communicationRecordFormContents,
      communicationRecordErrors,
    } = this.props;

    return (
      <Form
        form={communicationRecordForm}
        errors={communicationRecordErrors}
        title="Communication Record"
        submitTitle="Add Record"
        formContents={communicationRecordFormContents}
        onEdit={(n, v) =>
          dispatch(editFormAction('communicationrecord', n, v))}
        onSubmit={async () => {
          await dispatch(doSubmit(true));
          dispatch(doSubmit());
        }}
        />
    );
  }

  renderNewPartner() {
    const {dispatch, partnerFormContents, partnerErrors} = this.props;

    return (
      <Form
        form={partnerForm}
        errors={partnerErrors}
        title="Partner Data"
        submitTitle="Add Partner"
        formContents={partnerFormContents}
        onEdit={(n, v) => dispatch(editFormAction('partner', n, v))}
        onSubmit={async () => {
          await dispatch(doSubmit(true));
          dispatch(savePartnerAction());
        }}
        />
    );
  }

  renderNewContact() {
    const {dispatch, contactIndex, contactFormsContents} = this.props;
    const contactFormContents = contactFormsContents[contactIndex] || {};

    return (
      <Form
        form={contactForm}
        title="Contact Details"
        submitTitle="Add Contact"
        formContents={contactFormContents}
        onEdit={(n, v) =>
          dispatch(editFormAction('contacts', n, v, contactIndex))}
        onSubmit={async () => {
          await dispatch(doSubmit(true));
          dispatch(saveContactAction());
        }}
        />
    );
  }

  render() {
    const {processState} = this.props;

    if (processState === 'SELECT_PARTNER') {
      return this.renderInitialSearch();
    } else if (processState === 'SELECT_CONTACT') {
      return this.renderSelectContact();
    } else if (processState === 'NEW_COMMUNICATIONRECORD') {
      return this.renderNewCommunicationRecord();
    } else if (processState === 'NEW_PARTNER') {
      return this.renderNewPartner();
    } else if (processState === 'NEW_CONTACT') {
      return this.renderNewContact();
    }
    return <span/>;
  }
}

ProcessRecordPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  outreachId: PropTypes.string.isRequired,
  processState: PropTypes.string.isRequired,
  partnerName: PropTypes.string,
  partnerId: PropTypes.any,
  partnerFormContents: PropTypes.object.isRequired,
  contactFormsContents: PropTypes.arrayOf(
    PropTypes.object.isRequired).isRequired,
  contactIndex: PropTypes.number,
  communicationRecordFormContents: PropTypes.object.isRequired,
  partnerErrors: PropTypes.objectOf(PropTypes.string),
  contactsErrors: PropTypes.objectOf(PropTypes.string),
  communicationRecordErrors: PropTypes.objectOf(PropTypes.string),
};

export default connect(state => ({
  outreachId: state.process.outreachId,
  processState: state.process.state,
  partnerName: get(state.process, 'record.partner.partnername'),
  partnerId: get(state.process, 'record.partner.pk'),
  contactName: get(state.process, 'contact.name'),
  contactId: state.process.contactId,
  contactIndex: state.process.contactIndex,
  partnerFormContents: state.process.record.partner,
  contactFormsContents: state.process.record.contacts,
  communicationRecordFormContents:
    state.process.record.communicationrecord,
  partnerErrors: get(state.process, 'errors.partner', {}),
  contactsErrors: get(state.process, 'errors.contacts', {}),
  communicationRecordErrors:
    get(state.process, 'errors.communicationrecord', {}),
}))(ProcessRecordPage);
