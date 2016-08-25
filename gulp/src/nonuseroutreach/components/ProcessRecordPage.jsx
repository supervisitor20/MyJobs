import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {getDisplayForValue} from 'common/array.js';
import FieldWrapper from 'common/ui/FieldWrapper';
import Card from './Card';
import Form from './Form';
import SearchDrop from './SearchDrop';
import Select from 'common/ui/Select';
import {get} from 'lodash-compat/object';

import {
  partnerForm,
  contactForm,
  communicationRecordForm,
} from 'nonuseroutreach/forms';

import {
  determineProcessStateAction,
  choosePartnerAction,
  chooseContactAction,
  newPartnerAction,
  newContactAction,
  editFormAction,
  doSubmit,
} from '../actions/process-outreach-actions';

class ProcessRecordPage extends Component {
  handleChoosePartner(obj) {
    const {dispatch} = this.props;

    dispatch(choosePartnerAction(obj.value, obj.display));
    dispatch(determineProcessStateAction());
  }

  async handleChooseContact(obj, addPartner) {
    const {dispatch} = this.props;

    if (addPartner) {
      dispatch(choosePartnerAction(obj.partner.pk, obj.partner.name));
    }
    dispatch(chooseContactAction(obj.value, obj.display));
    dispatch(determineProcessStateAction());
  }

  async handleNewPartner(obj) {
    const {dispatch} = this.props;

    dispatch(newPartnerAction(obj.display));
  }

  async handleNewContact(obj) {
    const {dispatch} = this.props;

    dispatch(newContactAction(obj.display));
  }

  async handleSavePartner() {
    const {dispatch} = this.props;

    await dispatch(doSubmit(true));
    dispatch(determineProcessStateAction());
  }

  async handleSaveContact() {
    const {dispatch} = this.props;

    await dispatch(doSubmit(true));
    dispatch(determineProcessStateAction());
  }

  async handleSaveCommunicationRecord() {
    const {dispatch} = this.props;

    await dispatch(doSubmit(true));
    dispatch(determineProcessStateAction());
  }

  async handleSubmit() {
    const {dispatch, history} = this.props;

    await dispatch(doSubmit(false, () => history.pushState(null, '/records')));
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
            onSelect={obj => this.handleChooseContact(obj, true)}/>
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
            onSelect={obj => this.handleChooseContact(obj, false)}
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
    } = this.props;

    return (
      <Form
        form={communicationRecordForm}
        title="Communication Record"
        submitTitle="Add Record"
        formContents={communicationRecordFormContents}
        onEdit={(n, v) =>
          dispatch(editFormAction('communicationrecord', n, v))}
        onSubmit={() => this.handleSaveCommunicationRecord()}
        />
    );
  }

  renderNewPartner() {
    const {dispatch, partnerFormContents} = this.props;

    return (
      <Form
        form={partnerForm}
        title="Partner Data"
        submitTitle="Add Partner"
        formContents={partnerFormContents}
        onEdit={(n, v) => dispatch(editFormAction('partner', n, v))}
        onSubmit={() => this.handleSavePartner()}
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
        onSubmit={() => this.handleSaveContact()}
        />
    );
  }

  renderSelectWorkflow() {
    const {dispatch,
      workflowState,
      workflowStates,
    } = this.props;

    return (
      <Card title="Form Ready for Submission">
        <FieldWrapper label="Workflow Status">
          <Select
            name="workflow"
            value={getDisplayForValue(workflowStates, workflowState)}
            choices={workflowStates}
            onChange={e => dispatch(
              editFormAction(
                'outreachrecord',
                'current_workflow_state',
                e.target.value))}
            />
        </FieldWrapper>
        <button className="nuo-button" onClick={() => this.handleSubmit()}>
          Submit
        </button>
      </Card>
    );
  }

  render() {
    const {processState} = this.props;

    let contents = '';

    if (processState === 'SELECT_PARTNER') {
      contents = this.renderInitialSearch();
    } else if (processState === 'SELECT_CONTACT') {
      contents = this.renderSelectContact();
    } else if (processState === 'NEW_COMMUNICATIONRECORD') {
      contents = this.renderNewCommunicationRecord();
    } else if (processState === 'NEW_PARTNER') {
      contents = this.renderNewPartner();
    } else if (processState === 'NEW_CONTACT') {
      contents = this.renderNewContact();
    } else if (processState === 'SELECT_WORKFLOW_STATE') {
      contents = this.renderSelectWorkflow();
    }

    return (
      <div>
        <button className="nuo-button">
          <a href="/prm/view/nonuseroutreach/#/records">Back to record list</a>
        </button>
        {contents}
      </div>
    );
  }
}

ProcessRecordPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  outreachId: PropTypes.string.isRequired,
  processState: PropTypes.string.isRequired,
  partnerId: PropTypes.any,
  partnerFormContents: PropTypes.object.isRequired,
  contactFormsContents: PropTypes.arrayOf(
    PropTypes.object.isRequired).isRequired,
  contactIndex: PropTypes.number,
  communicationRecordFormContents: PropTypes.object.isRequired,
  workflowState: PropTypes.number,
  workflowStates: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      display: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
};

export default connect(state => ({
  outreachId: state.process.outreachId,
  processState: state.process.state,
  partnerId: get(state.process, 'record.partner.pk.value'),
  contactIndex: state.process.contactIndex,
  partnerFormContents: state.process.record.partner,
  contactFormsContents: state.process.record.contacts,
  communicationRecordFormContents:
    state.process.record.communicationrecord,
  workflowState:
    get(state.process.record, 'outreachrecord.current_workflow_state.value'),
  workflowStates: state.process.workflowStates,
}))(ProcessRecordPage);
