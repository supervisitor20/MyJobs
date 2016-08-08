import reducer, {defaultState} from '../reducers/process-outreach-reducer';

import {
  resetProcessAction,
  choosePartnerAction,
  chooseContactAction,
  newPartnerAction,
  newContactAction,
  receiveFormAction,
  editFormAction,
} from '../actions/process-outreach-actions';

describe('processEmailReducer', () => {
  describe('handling resetProcessAction', () => {
    const outreach = {
      summary: 'some title',
      body: 'some info',
    };
    const result = reducer({}, resetProcessAction(2, outreach));

    it('should set the default state.', () => {
      expect(result.state).toEqual('SELECT_PARTNER');
    });

    it('should remember the given outreach', () => {
      expect(result.outreach).toDiffEqual(outreach);
    });

    it('should remember the given outreach Id', () => {
      expect(result.outreachId).toDiffEqual(2);
    });
  });

  describe('handling choosePartnerAction', () => {
    const partner = {
      name: 'acme',
    };
    const result = reducer({}, choosePartnerAction(4, partner));

    it('should set the right state', () => {
      expect(result.state).toEqual('SELECT_CONTACT');
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
      expect(result.state).toEqual('NEW_COMMUNICATIONRECORD');
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

  describe('handling newContactAction', () => {
    const state = {
      contactId: 3,
      contact: {},
      partnerId: 4,
      partner: {},
    };
    const result = reducer(state, newContactAction('Some Person'));

    it('should set the right state', () => {
      expect(result.state).toEqual('NEW_CONTACT');
    });

    it('should have a blank contactId', () => {
      expect(result.contactId).toEqual('');
    });

    it('should have a contact name', () => {
      expect(result.contact.name).toEqual('Some Person');
    });

    it('should keep partnerId', () => {
      expect(result.partnerId).toEqual(4);
    });

    it('should keep partner', () => {
      expect(result.partner).toEqual({});
    });

  });

  describe('handling receiveFormAction', () => {
    const result = reducer({}, receiveFormAction({some: 'form'}));

    it('should have the form', () => {
      expect(result.form).toEqual({some: 'form'});
    });
  });

  describe('handling editFormAction', () => {

    describe('unindexed', () => {
      const action = editFormAction('partner', 'name', 'Bob');

      it('should create and store the field', () => {
        const result = reducer({}, action);

        expect(result.record.partner.name).toEqual('Bob');
      });

      it('should preserve other values', () => {
        const initialFormContents = {
          partner: {
            city: 'somewhere',
          },
          other: {
            a: 'b',
          },
        };

        const result = reducer({record: initialFormContents}, action);

        expect(result.record).toDiffEqual({
          partner: {
            city: 'somewhere',
            name: 'Bob',
          },
          other: {
            a: 'b',
          },
        });
      });
    });

    describe('indexed', () => {
      const action = editFormAction('contacts', 'name', 'Bob', 0);

      it('should create and store the field', () => {
        const result = reducer({}, action);

        expect(result.record.contacts[0].name).toEqual('Bob');
      });
    });
  });
});
