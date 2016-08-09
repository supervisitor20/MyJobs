import reducer, {defaultState} from '../reducers/process-email-reducer';

import {
  resetProcessAction,
  choosePartnerAction,
  chooseContactAction,
  newPartnerAction,
  receiveFormAction,
} from '../actions/process-email-actions';

describe('processEmailReducer', () => {
  describe('handling resetProcessAction', () => {
    const email = {
      summary: 'some title',
      body: 'some info',
    };
    const result = reducer({}, resetProcessAction(2, email));

    it('should set the default state.', () => {
      expect(result.state).toEqual('RESET');
    });

    it('should remember the given email', () => {
      expect(result.email).toDiffEqual(email);
    });

    it('should remember the given emailId', () => {
      expect(result.emailId).toDiffEqual(2);
    });
  });

  describe('handling choosePartnerAction', () => {
    const partner = {
      name: 'acme',
    };
    const result = reducer({}, choosePartnerAction(4, partner));

    it('should set the right state', () => {
      expect(result.state).toEqual('KNOWN_PARTNER');
    });

    it('should have the partner id', () => {
      expect(result.partnerId).toEqual(4);
    });

    it('should have the partner', () => {
      expect(result.partner).toEqual(partner);
    });
  });

  describe('handling chooseContactAction', () => {
    const state = {
      partnerId: 4,
      partner: {name: 'acme'},
    };
    const contact = {
      name: 'bob',
    };
    const result = reducer(state, chooseContactAction(3, contact));

    it('should set the right state', () => {
      expect(result.state).toEqual('KNOWN_CONTACT');
    });

    it('should have the contact id', () => {
      expect(result.contactId).toEqual(3);
    });

    it('should have the contact', () => {
      expect(result.contact).toEqual(contact);
    });

    it('should retain the partner', () => {
      expect(result.partnerId).toEqual(4);
      expect(result.partner).toEqual(state.partner);
    });
  });

  describe('handling newPartnerAction', () => {
    const state = {
      contactId: 3,
      contact: {},
      partnerId: 4,
      partner: {},
    };
    const result = reducer(state, newPartnerAction('Partner Name Inc.'));

    it('should set the right state', () => {
      expect(result.state).toEqual('NEW_PARTNER');
    });

    it('should have no contactId', () => {
      expect(result.contactId).not.toBeDefined();
    });

    it('should have no contact', () => {
      expect(result.contact).not.toBeDefined();
    });

    it('should have a blank partnerId', () => {
      expect(result.partnerId).toEqual('');
    });

    it('should have a partner name', () => {
      expect(result.partner.name).toEqual('Partner Name Inc.');
    });

  });

  describe('handling receiveFormAction', () => {
    const result = reducer({}, receiveFormAction({some: 'form'}));

    it('should have the form', () => {
      expect(result.form).toEqual({some: 'form'});
    });
  });
});


