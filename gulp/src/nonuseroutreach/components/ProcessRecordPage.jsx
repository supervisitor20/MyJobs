import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {Col, Row} from 'react-bootstrap';
import FieldWrapper from 'common/ui/FieldWrapper';
import RemoteFormField from 'common/ui/RemoteFormField';
import SearchDrop from './SearchDrop';
import {get} from 'lodash-compat/object';
import {map} from 'lodash-compat/collection';

import {
  choosePartnerAction,
  chooseContactAction,
  newPartnerAction,
  newContactAction,
  editFormAction,
  doLoadForm,
  doSubmit,
} from '../actions/process-outreach-actions';

class ProcessRecordPage extends Component {
  handleChoosePartner(obj) {
    const {dispatch} = this.props;

    dispatch(choosePartnerAction(obj.value, {value: '', name: obj.display}));
  }

  async handleChooseContact(obj) {
    const {dispatch} = this.props;

    await dispatch(doLoadForm('communicationrecord', 'new'));
    dispatch(chooseContactAction(obj.value, {value: '', name: obj.display}));
  }

  async handleNewPartner(obj) {
    const {dispatch} = this.props;

    await dispatch(doLoadForm('partner', 'new'));
    dispatch(newPartnerAction(obj.display));
  }

  async handleNewContact(obj) {
    const {dispatch} = this.props;

    await dispatch(doLoadForm('contact', 'new'));
    dispatch(newContactAction(obj.display));
  }

  renderCard(title, children) {
    return (
      <div className="cardWrapper">
        <Row>
          <Col xs={12}>
            <div className="wrapper-header">
              <h2>{title}</h2>
            </div>
            {children}
          </Col>
        </Row>
      </div>
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

  renderKnownContact() {
    const {dispatch, form, communicationRecordFormContents} = this.props;

    const fields = map(form.ordered_fields, fieldName => (
      <RemoteFormField
        key={fieldName}
        form={form}
        fieldName={fieldName}
        value={communicationRecordFormContents[fieldName] || ''}
        onChange={e =>
          dispatch(editFormAction(
            'communicationrecord', fieldName, e.target.value))}/>
    ));
    const button = (
      <button
        key="submitbutton"
        onClick={() => dispatch(doSubmit())}>Submit</button>
    );
    return this.renderCard('Communication Record', [...fields, button]);
  }

  renderNewPartner() {
    const {dispatch, form, partnerFormContents} = this.props;

    const fields = map(form.ordered_fields, fieldName => (
      <RemoteFormField
        key={fieldName}
        form={form}
        fieldName={fieldName}
        value={partnerFormContents[fieldName] || ''}
        onChange={e =>
          dispatch(editFormAction('partner', fieldName, e.target.value))}/>
    ));
    return this.renderCard('Partner Data', fields);
  }

  renderNewContact() {
    const {dispatch, form, contactFormsContents} = this.props;
    const formIndex = 0;
    const contactFormContents = contactFormsContents[formIndex] || {};

    const fields = map(form.ordered_fields, fieldName => (
      <RemoteFormField
        key={fieldName}
        form={form}
        fieldName={fieldName}
        value={contactFormContents[fieldName] || ''}
        onChange={e =>
          dispatch(editFormAction(
            'contact', fieldName, e.target.value, formIndex))}/>
    ));
    return this.renderCard('Contact Details', fields);
  }

  render() {
    const {processState} = this.props;

    if (processState === 'SELECT_PARTNER') {
      return this.renderInitialSearch();
    } else if (processState === 'SELECT_CONTACT') {
      return this.renderSelectContact();
    } else if (processState === 'NEW_COMMUNICATIONRECORD') {
      return this.renderKnownContact();
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
  form: PropTypes.object,
  outreachId: PropTypes.string.isRequired,
  processState: PropTypes.string.isRequired,
  partnerName: PropTypes.string,
  partnerId: PropTypes.any,
  partnerFormContents: PropTypes.object.isRequired,
  contactFormsContents: PropTypes.arrayOf(
    PropTypes.object.isRequired).isRequired,
  communicationRecordFormContents: PropTypes.object.isRequired,
};

export default connect(state => ({
  outreachId: state.process.outreachId,
  processState: state.process.state,
  partnerName: get(state.process, 'partner.name'),
  partnerId: state.process.partnerId,
  contactName: get(state.process, 'contact.name'),
  contactId: state.process.contactId,
  form: state.process.form,
  partnerFormContents: state.process.record.partner,
  contactFormsContents: state.process.record.contacts[0],
  communicationRecordFormContents:
    state.process.record.communicationrecord,
}))(ProcessRecordPage);
