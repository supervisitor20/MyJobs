import {InboxManagement, OutreachRecordManagement} from '../nonuseroutreachEngine';

import {promiseTest} from '../../common/spec';

const fakeApi = {
  getExistingInboxes: () => ([{pk: 1, fields: {email: 'thistest'}}]),
  getExistingOutreachRecords: () => ([{outreach_email: 'thistest',
                                       date_added:'04/18/2012',
                                       from_email:'test@test.com',
                                       email_body:'Test',
                                       current_workflow_state:'Reviewed'}]),
  deleteInbox: (id) => ({status: 'success'}),
  createNewInbox: (email) => ({pk: 1, email: 'thistest'}),
  updateInbox: (id, email) => ({status: 'success'}),
};

describe('Inbox Manager', () => {
  const inboxManager = new InboxManagement(fakeApi);

  it('can get existing inbox list', promiseTest(async () => {
    const inboxes = await inboxManager.getExistingInboxes();
    expect(inboxes[0].pk).toEqual(1);
    expect(inboxes[0].fields.email).toEqual('thistest');
  }));

  it('can create a new inbox', promiseTest(async () => {
    const response = await inboxManager.createNewInbox('thistest');
    expect(response.pk).toEqual(1);
    expect(response.email).toEqual('thistest');
  }));

  it('can delete existing inbox', promiseTest(async () => {
    const response = await inboxManager.deleteInbox(1);
    expect(response.status).toEqual('success');
  }));

  it('can edit exising inbox', promiseTest(async () => {
    const response = await inboxManager.updateInbox(1, 'thattest');
    expect(response.status).toEqual('success');
  }));

  it('can validate email usernames', () => {
    expect(inboxManager.validateEmailInput('popeyes@').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes..a').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes.').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes').success).toEqual(true);
  });
});

describe('Records Manager', () => {
  const recordsManager = new OutreachRecordManagement(fakeApi);

  it('can get existing records list', promiseTest(async () => {
    const records = await recordsManager.getExistingInboxes();
    expect(records[0].outreach_email).toEqual('thistest');
    expect(records[0].from_email).toEqual('test@test.com');
  }));
});
