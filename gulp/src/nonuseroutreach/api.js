class Api {
  constructor(myJobsApi) {
    this.myJobsApi = myJobsApi;
  }

  async getFromNuoApi(url) {
    return this.myJobsApi.get(url);
  }

  async postToNuoApi(url, data) {
    return this.myJobsApi.post(url, data);
  }

  async getExistingInboxes() {
    return await this.getFromNuoApi('/prm/api/nonuseroutreach/inbox/list');
  }

  async getExistingOutreachRecords() {
    return await this.getFromNuoApi('/prm/api/nonuseroutreach/records/list');
  }

  async createNewInbox(email) {
    const promise = this.postToNuoApi('/prm/api/nonuseroutreach/inbox/add', {
      email: email,
    });
    return (await promise);
  }

  async updateInbox(id, email) {
    const promise = this.postToNuoApi(
      '/prm/api/nonuseroutreach/inbox/update', {
        id: id,
        email: email,
      }
    );
    return (await promise);
  }

  async deleteInbox(id) {
    const promise = this.postToNuoApi(
      '/prm/api/nonuseroutreach/inbox/delete/', {'id': id}
    );
    return (await promise);
  }
}

export {Api as default};
