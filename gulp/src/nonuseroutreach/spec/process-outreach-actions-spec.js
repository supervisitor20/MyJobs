import processEmailReducer from '../reducers/process-outreach-reducer';
import errorReducer from '../../common/reducers/error-reducer';
import {keys} from 'lodash-compat';

import {
  doLoadEmail,
  resetProcessAction,
  convertOutreach,
  extractErrorObject,
  formatContact,
  flattenContact,
  formsFromApi,
  formsToApi,
} from '../actions/process-outreach-actions';

import {promiseTest} from '../../common/spec';

import createReduxStore from '../../common/create-redux-store';
import {combineReducers} from 'redux';

class FakeApi {
  getOutreach() {}
  getWorkflowStates() {}
  getForm() {}
}

describe('convertOutreach', () => {
  const record = {
    date_added: "06-17-2016",
    from_email: "bob@example.com",
    email_body: "some text",
    outreach_email: "testemail@my.jobs",
    current_workflow_state: "Reviewed",
    subject: "Subject",
  };
  const result = convertOutreach(record);

  it('should change the keys of fields', () => {
    expect(result).toDiffEqual({
      dateAdded: "06-17-2016",
      outreachFrom: "bob@example.com",
      outreachBody: "some text",
      outreachInbox: "testemail@my.jobs",
      workflowState: "Reviewed",
      outreachSubject: "Subject",
    });
  });
});

describe('initial load', () => {
  let store;
  let api;

  beforeEach(() => {
    api = new FakeApi();
    store = createReduxStore(
      combineReducers({process: processEmailReducer, error: errorReducer}),
      {}, {api});
  });

  describe('after load', () => {
    const outreach = {
      from_email: "bob@example.com",
      email_body: "some text",
    };
    const workflowStates = [
      {id: 1, name: 'a'},
      {id: 2, name: 'b'},
    ];
    beforeEach(promiseTest(async () => {
      spyOn(api, 'getOutreach').and.returnValue(Promise.resolve(outreach));
      spyOn(api, 'getWorkflowStates').and.returnValue(
        Promise.resolve(workflowStates));
      await store.dispatch(doLoadEmail(2));
    }));

    it('should have the outreach', () => {
      expect(store.getState().process.outreach).toDiffEqual(
        convertOutreach(outreach));
    });

    it('should have the outreachId', () => {
      expect(store.getState().process.outreachId).toEqual(2);
    });

    it('should have the workflow states', () => {
      expect(store.getState().process.workflowStates).toEqual([
        {value: 1, display: 'a'},
        {value: 2, display: 'b'},
      ]);
    });

    it('should be in the right state', () => {
      expect(store.getState().process.state).toEqual('SELECT_PARTNER');
    });
  });

  describe('after an error', () => {
    beforeEach(promiseTest(async () => {
      spyOn(api, 'getOutreach').and.throwError('some error');
      await store.dispatch(doLoadEmail(2));
    }));

    it('should remember the error', () => {
      expect(store.getState().error.lastMessage).toEqual('some error');
    });
  });
});

describe('extractErrorObject', () => {
  it('handles undefined', () => {
    const result = extractErrorObject();
    expect(result).toEqual({});
  });

  it('handles empty list', () => {
    const result = extractErrorObject([]);
    expect(result).toEqual({});
  });

  it('handles entries', () => {
    const result = extractErrorObject([
      {field: 'a', message: 'aa'},
      {field: 'b', message: 'bb'},
    ]);
    expect(result).toEqual({
      a: 'aa',
      b: 'bb',
    });
  });
});

describe('formatContact', () => {
  it('moves location data', () => {
    const contact = {
      pk: {value: ''},
      name: {value: 'a'},
      email: {value: 'b'},
      phone: {value: 'c'},
      address_line_one: {value: 'd'},
      address_line_two: {value: 'e'},
      city: {value: 'f'},
      state: {value: 'g'},
      label: {value: 'h'},
      tags: [],
      notes: {value: 'i'},
    };
    expect(formatContact(contact)).toDiffEqual({
      pk: {value: ''},
      name: {value: 'a'},
      email: {value: 'b'},
      phone: {value: 'c'},
      location: {
        pk: {value: ''},
        address_line_one: {value: 'd'},
        address_line_two: {value: 'e'},
        city: {value: 'f'},
        state: {value: 'g'},
        label: {value: 'h'},
      },
      tags: [],
      notes: {value: 'i'},
    });
  });

  it('does not introduce a location key when linking', () => {
    const contact = {
      pk: {value: 333},
      name: {value: 'a'},
    };
    expect(formatContact(contact)).toDiffEqual(contact);
  });


  it('handles an empty object', () => {
    const contact = {};
    expect(formatContact(contact)).toDiffEqual({
      pk: {value: ''},
      location: {
        pk: {value: ''},
      },
      tags: [],
    });
  });
});

describe('flattenContact', () => {
  it('moves location data', () => {
    const contact = {
      pk: {value: ''},
      name: {value: 'a'},
      email: {value: 'b'},
      phone: {value: 'c'},
      location: {
        pk: {value: ''},
        address_line_one: {value: 'd'},
        address_line_two: {value: 'e'},
        city: {value: 'f'},
        state: {value: 'g'},
        label: {value: 'h'},
      },
      tags: [],
      notes: {value: 'i'},
    };
    expect(flattenContact(contact)).toDiffEqual({
      pk: {value: ''},
      name: {value: 'a'},
      email: {value: 'b'},
      phone: {value: 'c'},
      address_line_one: {value: 'd'},
      address_line_two: {value: 'e'},
      city: {value: 'f'},
      state: {value: 'g'},
      label: {value: 'h'},
      tags: [],
      notes: {value: 'i'},
    });
  });

  it('handles links', () => {
    const contact = {
      pk: {value: 333},
      name: {value: 'a'},
    };
    expect(flattenContact(contact)).toDiffEqual({
      pk: {value: 333},
      name: {value: 'a'},
    });
  });
});

describe('formsFromApi', () => {
  it('copies input', () => {
    const input = {};
    const output = formsFromApi(input);
    expect(output).not.toBe(input);
  });

  it('flattens contact forms', () => {
    const contact = {
      pk: {value: ''},
      name: {value: 'a'},
      location: {
        pk: {value: ''},
        city: {value: 'f'},
        state: {value: 'g'},
      },
    };
    const partner = {1: 2};
    const input = {
      partner,
      contacts: [contact, contact],
    };
    const output = formsFromApi(input);
    const flatContact = {
      pk: {value: ''},
      name: {value: 'a'},
      city: {value: 'f'},
      state: {value: 'g'},
    };
    expect(output).toDiffEqual({
      partner,
      contacts: [flatContact, flatContact],
    });
  });

  it('renames commrec', () => {
    const input = {
      contactrecord: {1: 2},
    };

    const output = formsFromApi(input);
    expect(output).toDiffEqual({
      communicationrecord: {1: 2},
    });
    expect(output.communicationrecord).not.toBe(input.contactrecord);
  });

  it('copies partner and outreach', () => {
    const partner = {1: 2};
    const outreachrecord = {1: 2};

    const output = formsFromApi({partner, outreachrecord});
    expect(output.partner).not.toBe(partner);
    expect(output.outreachrecord).not.toBe(outreachrecord);
  });
});

describe('formsToApi', () => {
  it('copies input', () => {
    const input = {};
    const output = formsToApi(input);
    expect(output).not.toBe(input);
  });

  it('formats contact forms', () => {
    const flatContact = {
      pk: {value: ''},
      name: {value: 'a', errors: ['a']},
      email: {value: 'e'},
      phone: {value: 'p'},
      address_line_one: {value: 'a1', errors: ['a']},
      address_line_two: {value: 'a2'},
      label: {value: 'll'},
      city: {value: 'f'},
      state: {value: 'g'},
      notes: {value: 'n'},
    };
    const hasErrors = {
      name: {
        value: 'someone',
        errors: ['b'],
      },
    };
    const input = {
      partner: hasErrors,
      contacts: [flatContact, flatContact],
      outreachrecord: hasErrors,
      communicationrecord: hasErrors,
    };
    const output = formsToApi(input);
    const contact = {
      pk: {value: ''},
      name: {value: 'a'},
      email: {value: 'e'},
      phone: {value: 'p'},
      location: {
        pk: {value: ''},
        city: {value: 'f'},
        state: {value: 'g'},
        address_line_one: {value: 'a1'},
        address_line_two: {value: 'a2'},
        label: {value: 'll'},
      },
      tags: [],
      notes: {value: 'n'},
    };
    const noErrors = {
      name: {value: 'someone'},
    };
    expect(output).toDiffEqual({
      outreachrecord: noErrors,
      partner: noErrors,
      contacts: [contact, contact],
      contactrecord: noErrors,
    });
  });

  it('removes empty value objects', () => {
    const flatContact = {
      pk: {value: ''},
      name: {value: 'a', errors: ['a']},
      email: {value: 'e'},
      city: {errors: ['a']},
      state: {errors: ['b']},
      notes: {value: 'n'},
    };
    const hasErrors = {
      name: {
        value: 'someone',
        errors: ['b'],
      },
    };
    const input = {
      partner: hasErrors,
      contacts: [flatContact, flatContact],
      outreachrecord: hasErrors,
      communicationrecord: hasErrors,
    };
    const output = formsToApi(input);
    const contact = {
      pk: {value: ''},
      name: {value: 'a'},
      email: {value: 'e'},
      location: {
        pk: {value: ''},
      },
      tags: [],
      notes: {value: 'n'},
    };
    const noErrors = {
      name: {value: 'someone'},
    };
    expect(output).toDiffEqual({
      outreachrecord: noErrors,
      partner: noErrors,
      contacts: [contact, contact],
      contactrecord: noErrors,
    });
  })

  it('renames commrec', () => {
    const input = {
      communicationrecord: {1: 2},
    };

    const output = formsToApi(input);
    expect(output).toDiffEqual({
      outreachrecord: {},
      partner: {},
      contacts: [],
      contactrecord: {1: 2},
    });
    expect(output.contactrecord).not.toBe(input.communicationrecord);
  });

  it('copies partner and outreach', () => {
    const partner = {1: 2};
    const outreachrecord = {1: 2};

    const output = formsToApi({partner, outreachrecord});
    expect(output.partner).not.toBe(partner);
    expect(output.outreachrecord).not.toBe(outreachrecord);
  });
});
