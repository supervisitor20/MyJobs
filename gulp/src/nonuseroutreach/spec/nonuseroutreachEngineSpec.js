import {InboxManagement} from '../nonuseroutreachEngine';

import {promiseTest} from '../../common/spec';

const fakeApi = {
  getExistingInboxes: () => ([{pk: 1, fields: {email: 'thistest'}}]),
  deleteInbox: (id) => ({status: 'success'}),
  createNewInbox: (email) => ({pk: 1, email: 'thistest'}),
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

  it('can validate email usernames', () => {
    expect(inboxManager.validateEmailInput('popeyes@').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes..a').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes.').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes').success).toEqual(true);
  });
});
