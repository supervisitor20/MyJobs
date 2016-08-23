import reducer, {defaultState} from '../reducers/process-outreach-reducer';
import {
  resetProcessAction,
  determineProcessStateAction,
  choosePartnerAction,
  chooseContactAction,
  newPartnerAction,
  newContactAction,
  editFormAction,
  savePartnerAction,
  saveContactAction,
  saveCommunicationRecordAction,
  noteErrorsAction,
  editPartnerAction,
  editContactAction,
  editCommunicationRecordAction,
  deletePartnerAction,
  deleteContactAction,
  deleteCommunicationRecordAction,
} from '../actions/process-outreach-actions';

describe('processEmailReducer', () => {
  describe('handling resetProcessAction', () => {
    const outreach = {
      summary: 'some title',
      body: 'some info',
    };
    const states = [{1: 2}];
    const result = reducer({}, resetProcessAction(2, outreach, states));

    it('should set the default state.', () => {
      expect(result.state).toEqual('SELECT_PARTNER');
    });

    it('should remember the given outreach', () => {
      expect(result.outreach).toDiffEqual(outreach);
    });

    it('should remember the given outreach Id', () => {
      expect(result.outreachId).toDiffEqual(2);
    });

    it('should remember the given workflow states', () => {
      expect(result.workflowStates).toDiffEqual(states);
    });
  });

  describe('handling choosePartnerAction', () => {
    const result = reducer(
      {record: {partner: {}}},
      choosePartnerAction(4, 'acme'));

    it('should have the partner id', () => {
      expect(result.record.partner.pk).toEqual(4);
    });

    it('should have the partner name', () => {
      expect(result.record.partner.partnername).toEqual('acme');
    });
  });

  describe('handling chooseContactAction', () => {
    const state = {
      record: {
        partner: {
          pk: 4,
          name: 'acme',
        },
        contacts: [
          {pk: 99},
        ],
      },
    };
    const result = reducer(state, chooseContactAction(3, 'bob'));

    it('should have the previous contacts', () => {
      expect(result.record.contacts[0]).toEqual(state.record.contacts[0]);
    });

    it('should have the contact id', () => {
      expect(result.record.contacts[1].pk).toEqual(3);
    });

    it('should have the contact name', () => {
      expect(result.record.contacts[1].name).toEqual('bob');
    });

    it('should retain the partner', () => {
      expect(result.record.partner).toEqual(state.record.partner);
    });
  });

  describe('handling newPartnerAction', () => {
    const state = {
      record: {
        contacts: [{pk: 3}],
        partner: {pk: 4},
      },
    };
    const result = reducer(state, newPartnerAction('Partner Name Inc.'));

    it('should set the right state', () => {
      expect(result.state).toEqual('NEW_PARTNER');
    });

    it('should retain contacts', () => {
      expect(result.record.contacts).toEqual(state.record.contacts);
    });

    it('should have a blank partnerId', () => {
      expect(result.record.partner.pk).toEqual('');
    });

    it('should have a partner name', () => {
      expect(result.record.partner.name).toEqual('Partner Name Inc.');
    });

  });

  describe('handling newContactAction', () => {
    const state = {
      record: {
        contacts: [{pk: 3}],
        partner: {pk: 4},
      },
    };
    const result = reducer(state, newContactAction('Some Person'));

    it('should set the right state', () => {
      expect(result.state).toEqual('NEW_CONTACT');
      expect(result.contactIndex).toEqual(1);
    });

    it('should have a blank contactId', () => {
      expect(result.record.contacts[1].pk).toEqual('');
    });

    it('should have a contact name', () => {
      expect(result.record.contacts[1].name).toEqual('Some Person');
    });

    it('should keep the previous contacts', () => {
      expect(result.record.contacts[0]).toEqual(state.record.contacts[0]);
    });

    it('should keep the partner', () => {
      expect(result.record.partner).toEqual(state.record.partner);
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

describe('handling noteErrorsAction', () => {
  const result = reducer({}, noteErrorsAction({1: 2}));

  it('should place errors', () => {
    expect(result.errors).toEqual({1: 2});
  });
});

describe('handling editPartnerAction', () => {
  it('should switch state to new if there is no pk', () => {
    const result = reducer({}, editPartnerAction());
    expect(result.state).toEqual('NEW_PARTNER');
  });

  it('should switch state to select if there is a pk', () => {
    const result = reducer({
      record: {
        partner: {pk: 3},
      },
    }, editPartnerAction());
    expect(result.state).toEqual('SELECT_PARTNER');
  });
});

describe('handling editContactAction', () => {
  describe('when there is no pk', () => {
    const result = reducer({}, editContactAction(3));

    it('should switch state to new if there is no pk', () => {
      expect(result.state).toEqual('NEW_CONTACT');
    });

    it('should set the contact index', () => {
      expect(result.contactIndex).toEqual(3);
    });
  });

  describe('when there is no pk', () => {
    const result = reducer({
      record: {
        contact: [{pk: 3}],
      },
    }, editContactAction(0));

    it('should switch state to select if there is a pk', () => {
      expect(result.state).toEqual('SELECT_CONTACT');
    });

    it('should set the contact index', () => {
      expect(result.contactIndex).toEqual(0);
    });
  });
});

describe('handling editCommunicationRecordAction', () => {
  const result = reducer({}, editCommunicationRecordAction());

  it('should switch state', () => {
    expect(result.state).toEqual('NEW_COMMUNICATIONRECORD');
  });
});

describe('handling deleteContactAction', () => {
  const result = reducer({
    record: {
      contacts:[{pk: 3}, {pk: 4}],
    },
  }, deleteContactAction(0));

  it ('should remove contact by index', () => {
    expect(result.record.contacts).toEqual([{pk: 4}]);
  });
});

describe('handling deletePartnerAction', () => {
  const result = reducer({
    record: {
      partner: {pk: 1},
      contacts: [{pk: 1}, {pk: ''}],
    },
  }, deletePartnerAction(0));

  it ('should remove partner', () => {
    expect(result.record.partner).toEqual({});
  })

  it ('should remove any selected contacts that are linked to that partner',
    () => { expect(result.record.contacts).toEqual([{pk: ''}])
  });

});

describe('handling deleteCommunicationRecordAction', () => {
  const result = reducer({record: {communicationrecord: {stuff:'stuff'}}},
    deleteCommunicationRecordAction());

  it ('should delete communication record', () => {
    expect(result.record.communicationrecord).toEqual({});
  });
});

describe('handling determineProcessStateAction', () => {
  let originalState = {
      partner: {pk:1},
      contacts: [{pk:1}, {pk:2}],
      communicationrecord: {this:'that'},
  }
  describe('without a partner' , () => {
    const result = reducer(
      {record: {...originalState, partner:{}}},
      determineProcessStateAction());

    it ('should direct to SELECT_PARTNER', () => {
      expect(result.state).toEqual('SELECT_PARTNER');
    })
  });
  describe('without any contacts but with a partner' , () => {
    const result = reducer(
      {record: {...originalState, contacts:[]}},
      determineProcessStateAction());

    it ('should direct to SELECT_CONTACT', () => {
      expect(result.state).toEqual('SELECT_CONTACT');
    })
  });
  describe('without a comm rec but with a partner and contacts' , () => {
    const result = reducer(
      {record: {...originalState, communicationrecord:{}}},
      determineProcessStateAction());

    it ('should direct to NEW_COMMUNICATIONRECORD', () => {
      expect(result.state).toEqual('NEW_COMMUNICATIONRECORD');
    })
  });
});