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
  newPartnerAction,
  doLoadForm,
} from '../actions/process-email-actions';

class ProcessRecordPage extends Component {
  handleChoosePartner(obj) {
    const {dispatch} = this.props;

    dispatch(choosePartnerAction(obj.value, {value: '', name: obj.display}));
  }

  async handleNewPartner(obj) {
    const {dispatch} = this.props;

    await dispatch(doLoadForm('partner', 'new'));
    dispatch(newPartnerAction(obj.display));
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
            onSelect={obj => obj}/>
        </FieldWrapper>
      </div>,
    ]));
  }

  renderKnownPartner() {
    const {partnerName, partnerId} = this.props;

    return this.renderCard('Add Contact', ([
      <div key="partner" className="product-card no-highlight clearfix">
        <FieldWrapper label="Partner">
          {partnerName}
        </FieldWrapper>
      </div>,
      <div key="contact" className="product-card no-highlight clearfix">
        <FieldWrapper label="Contact Search">
          <SearchDrop
            instance="CONTACT"
            partnerId={partnerId}
            onSelect={obj => obj}/>
        </FieldWrapper>
      </div>,
    ]));
  }

  renderNewPartner() {
    const {form} = this.props;
    const formContents = {};

    const fields = map(form.ordered_fields, fieldName => (
      <RemoteFormField
        key={fieldName}
        form={form}
        fieldName={fieldName}
        value={formContents[fieldName] || ''}
        onChange={(e, n) => [e, n]}/>
    ));
    return this.renderCard('Partner Data', fields);
  }

  render() {
    const {processState} = this.props;

    if (processState === 'RESET') {
      return this.renderInitialSearch();
    } else if (processState === 'KNOWN_PARTNER') {
      return this.renderKnownPartner();
    } else if (processState === 'NEW_PARTNER') {
      return this.renderNewPartner();
    }
    return '';
  }
}

ProcessRecordPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  form: PropTypes.object,
  recordId: PropTypes.string.isRequired,
  processState: PropTypes.string.isRequired,
  partnerName: PropTypes.string,
  partnerId: PropTypes.any,
};

export default connect(state => ({
  recordId: state.process.emailId,
  processState: state.process.state,
  partnerName: get(state.process, 'partner.name'),
  partnerId: state.process.partnerId,
  contactName: get(state.process, 'contact.name'),
  contactId: state.process.contactId,
  form: state.process.form,
}))(ProcessRecordPage);
