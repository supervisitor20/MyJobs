import {InboxManagement} from '../nonuseroutreachEngine';

import {promiseTest} from '../../common/spec';

const fakeApi = {
  getExistingInboxes: () => ([{pk: 1, fields: {email: 'thistest'}}]),
};

describe('Inbox Manager', () => {
  const inboxManager = new InboxManagement(fakeApi);

  it('can get existing inbox list', promiseTest(async () => {
    const inboxes = await inboxManager.getExistingInboxes();
    expect(inboxes[0].pk).toEqual(1);
    expect(inboxes[0].fields.email).toEqual('thistest');
  }));

  it('can validate email usernames', () => {
    expect(inboxManager.validateEmailInput('popeyes@').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes..a').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes.').success).toEqual(false);
    expect(inboxManager.validateEmailInput('popeyes').success).toEqual(true);
  });
});
