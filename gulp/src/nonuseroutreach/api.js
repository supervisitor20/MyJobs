export default class Api {
  constructor(api) {
    this.api = api;
  }

  async getExistingInboxes() {
    return await this.api.get('/prm/api/nonuseroutreach/inbox/list');
  }

  async getExistingOutreachRecords() {
    return await this.api.get('/prm/api/nonuseroutreach/records/list');
  }

  async createNewInbox(email) {
    const promise = this.api.post('/prm/api/nonuseroutreach/inbox/add', {
      email: email,
    });
    return (await promise);
  }

  async updateInbox(id, email) {
    const promise = this.api.post(
      '/prm/api/nonuseroutreach/inbox/update', {
        id: id,
        email: email,
      }
    );
    return (await promise);
  }

  async deleteInbox(id) {
    const promise = this.api.post(
      '/prm/api/nonuseroutreach/inbox/delete/', {'id': id}
    );
    return (await promise);
  }
}
