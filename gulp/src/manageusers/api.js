export default class Api {
  constructor(api) {
    this.api = api;
  }

  async getActivities() {
    return await this.api.get('/manage-users/api/activities/');
  }

  async getUsers() {
    return await this.api.get('/manage-users/api/users/');
  }

  // TODO: replace getRoles once that page is converted
  async getAllRoles() {
    return await this.api.get('/manage-users/api/roles/all/');
  }
}
